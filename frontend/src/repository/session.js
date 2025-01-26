import { getMockedCurrentUser } from "@/utils/mockDataGenerator";
import { getMockedCurrentVault } from "@/utils/mockDataGenerator";

export class User {
  constructor(params = {}) {
    const { id, name, email, role } = params;

    if (!id || !name || !email || !role) {
      console.warn(
        "User initialisation is missing required parameters. This could lead to unexpected behaviour."
      );
    }

    this.id = id;
    this.name = name || "";
    this.email = email || "";
    this.role = role || "user";
  }
}

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
    this.user = null;
    this.vault = null;
  }

  async login() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Here we would typically validate credentials against a backend
    // In ICP blockchain, we would use the identity provider to validate credentials
    // OR we could wait until the user goes through the internet identity flow
    // OR we could wait until the user goes through the NFID flow
    this.user = getMockedCurrentUser();
    this.vault = getMockedCurrentVault();

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
