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

// Custom error class for session initialization
class SessionInitializationError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'SessionInitializationError';
    this.originalError = originalError;
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
    if (!this.ManagerActor) {
      throw new SessionInitializationError('ManagerActor not initialized. Call initialize() first.');
    }

    try {
      const user = await this.ManagerActor.getUser();
      console.log("User obtained successfully");
      return user;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw new SessionInitializationError('Failed to get current user', error);
    }
  }

  async initialize(agent) {
    if (!agent) {
      throw new SessionInitializationError('Agent is required for initialization');
    }

    try {
      console.log('Starting session initialization...');
      this.AuthenticatedAgent = agent;

      // Fetch root key for certificate validation during development
      if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
        console.log('Development environment detected, fetching root key...');
        try {
          await this.AuthenticatedAgent.fetchRootKey();
          console.log('Root key fetched successfully');
        } catch (err) {
          console.warn('Root key fetch failed:', err);
          throw new SessionInitializationError(
            'Failed to fetch root key. Please ensure your local replica is running.',
            err
          );
        }
      }

      if (!GlobalSettings.session.icp.manager_canister_id) {
        throw new SessionInitializationError('Manager canister ID is not configured');
      }

      this.ManagerActor = Actor.createActor(ManagerIDLFactory, {
        canisterId: GlobalSettings.session.icp.manager_canister_id,
        agent: this.AuthenticatedAgent,
      });

      const user = await this.getCurrentUser();
      
      return { user };
    } catch (error) {
      // Clean up resources if initialization fails
      this.AuthenticatedAgent = null;
      this.ManagerActor = null;
      
      if (error instanceof SessionInitializationError) {
        throw error;
      }
      throw new SessionInitializationError('Failed to initialize session', error);
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
