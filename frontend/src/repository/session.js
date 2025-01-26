import { getMockedCurrentUser } from "@/utils/mockDataGenerator";
import { getMockedCurrentVault } from "@/utils/mockDataGenerator";


// Repository interface (abstract class)
export class SessionRepository {
  async login() {
    throw new Error("Not implemented");
  }

  async getCurrentUser() {
    throw new Error("Not implemented");
  }

  async getCurrentVault() {
    throw new Error("Not implemented");
  }

  async fetchSession() {
    throw new Error("Not implemented");
  }
}

// In-memory implementation of the repository
class InMemorySessionRepository extends SessionRepository {
  constructor() {
    super();
    this.user = getMockedCurrentUser();
    this.vault = getMockedCurrentVault();
  }

  async login() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      user: this.user,
      vault: this.vault,
    };
  }

  async getCurrentUser() {
    return this.user;
  }

  async getCurrentVault() {
    return this.vault;
  }

  async fetchSession() {
    return {
      user: this.user,
      vault: this.vault,
    };
  }
}

export { InMemorySessionRepository };
