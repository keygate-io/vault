import { getMockedCurrentUser } from "@/utils/mockDataGenerator";
import { getMockedCurrentVault } from "@/utils/mockDataGenerator";
import { Actor } from "@dfinity/agent";
import { idlFactory as ManagerIDLFactory } from "../../idl/manager";
import { GlobalSettings } from "@/constants/global_config";
import { injectable, decorate } from "inversify";

// Repository interface
export class ISessionRepository {
  async login() {
    throw new Error("Method not implemented");
  }
  async getCurrentUser() {
    throw new Error("Method not implemented");
  }
  async getCurrentVault() {
    throw new Error("Method not implemented");
  }
  async fetchSession() {
    throw new Error("Method not implemented");
  }
}

// In-memory implementation of the repository
export class InMemorySessionRepository extends ISessionRepository {
  constructor() {
    super();
    this.user = null;
    this.vault = null;

    if (GlobalSettings.session.mock.initialize_at_startup) {
      this.user = getMockedCurrentUser();
      this.vault = getMockedCurrentVault();
    }
  }

  async login() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      user: this.user,
      vault: this.vault,
    };
  }

  async setAuthenticatedAgent(agent) {
    throw new Error(
      "InMemorySessionRepository does not support setting an authenticated agent"
    );
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

export class ICPSessionRepository extends ISessionRepository {
  constructor() {
    super();
    this.AuthenticatedAgent = null;
    this.VaultActor = null;
    this.ManagerActor = null;
  }

  async login() {
    throw new Error("Not implemented");
  }

  async getCurrentUser() {
    const user = await this.ManagerActor.getUser();
    return user;
  }

  async initialize(agent) {
    this.AuthenticatedAgent = agent;

    // Fetch root key for certificate validation during development
    if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
      await this.AuthenticatedAgent.fetchRootKey().catch((err) => {
        console.warn(
          "Unable to fetch root key. Check to ensure that your local replica is running."
        );
        console.error(err);
      });
    }

    this.ManagerActor = Actor.createActor(ManagerIDLFactory, {
      canisterId: GlobalSettings.session.icp.manager_canister_id,
      agent: this.AuthenticatedAgent,
    });

    try {
      const user = await this.getCurrentUser();
      return { user };
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  }

  async getCurrentVault() {
    throw new Error("ICPSessionRepository does not support getCurrentVault");
  }

  async fetchSession() {
    throw new Error("ICPSessionRepository does not support fetchSession");
  }
}

decorate(injectable(), InMemorySessionRepository);
decorate(injectable(), ICPSessionRepository);

export const SESSION_REPOSITORY = Symbol.for("SESSION_REPOSITORY");
