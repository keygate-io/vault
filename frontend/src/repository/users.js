import { GlobalSettings } from "@/constants/global_config";
import {
  generateMockUserId,
  generateMockUsers,
} from "@/utils/mockDataGenerator";
import { decorate, injectable, inject } from "inversify";
import { SESSION_REPOSITORY } from "@/repository/session";

export class User {
  constructor(params = {}) {
    const { id, name, address, avatarUrl } = params;

    if (!id || !name || !address) {
      console.warn(
        "User initialisation is missing required parameters. This could lead to unexpected behaviour."
      );
    }

    this.id = id;
    this.name = name || "";
    this.address = address || "";
    this.avatarUrl = avatarUrl || "";
  }
}

// Repository interface (abstract class)
export class UserRepository {
  async getAll() {
    throw new Error("Not implemented");
  }

  async getById(id) {
    throw new Error("Not implemented");
  }

  async register(userData) {
    throw new Error("Not implemented");
  }

  async deleteById(id) {
    throw new Error("Not implemented");
  }

  async update(id, userData) {
    throw new Error("Not implemented");
  }
}

// Prepare mocked users
const mockedUsers = generateMockUsers();

// In-memory implementation of the repository
class InMemoryUserRepository extends UserRepository {
  constructor(initialUsers = []) {
    super();
    this.users = new Map();

    if (GlobalSettings.users?.source === "mock") {
      initialUsers = mockedUsers;
    }

    initialUsers.forEach((user) => this.users.set(user.id, user));
  }

  async getAll() {
    return Array.from(this.users.values());
  }

  async getById(id) {
    return this.users.get(id);
  }

  async register(userData) {
    const id = generateMockUserId();

    // Simulate registration request to external service
    await setTimeout(() => {}, 2000);

    const newUser = new User({ ...userData, id });
    this.users.set(id, newUser);

    return newUser;
  }

  async deleteById(id) {
    // Simulate delete request to external service
    await setTimeout(() => {}, 1000);
    return this.users.delete(id);
  }

  async update(id, userData) {
    if (!this.users.has(id)) return null;

    // Simulate update request to external service
    await setTimeout(() => {}, 1000);

    const updatedUser = new User({ ...userData, id });
    this.users.set(id, updatedUser);
    return updatedUser;
  }
}

export { InMemoryUserRepository };

export class ICPUserRepository extends UserRepository {
  constructor(sessionRepository) {
    super();
    this.sessionRepository = sessionRepository;
  }

  async getAll() {
    const managerActor = this.sessionRepository.ManagerActor;
    if (!managerActor) {
      throw new Error("Manager actor not initialized");
    }

    try {
      const users = await managerActor.getUsers();
      return users.map(user => 
        new User({
          id: user.principal.toString(),
          name: user.name
        })
      );
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async getById(id) {
    const managerActor = this.sessionRepository.ManagerActor;
    if (!managerActor) {
      throw new Error("Manager actor not initialized");
    }

    try {
      const result = await managerActor.getUser();
      if (result.err) {
        throw new Error(result.err);
      }
      const user = result.ok;
      return new User({
        id: user.principal.toString(),
        name: user.name,
        address: user.principal.toString()
      });
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

}

decorate(injectable(), ICPUserRepository);
decorate(inject(SESSION_REPOSITORY), ICPUserRepository, 0);

export const USER_REPOSITORY = Symbol.for("USER_REPOSITORY");
