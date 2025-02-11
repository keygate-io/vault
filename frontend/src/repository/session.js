import { getMockedCurrentUser } from "@/utils/mockDataGenerator";
import { getMockedCurrentVault } from "@/utils/mockDataGenerator";
import { Actor } from "@dfinity/agent";
import { idlFactory as ManagerIDLFactory } from "../../idl/manager";
import { idlFactory as VaultIDLFactory } from "../../idl/vault";
import { GlobalSettings } from "@/constants/global_config";
import { Principal } from "@dfinity/principal";
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
    this.FocusedVault = null;
  }

  // Fetch root key for certificate validation during development
  async fetchRootKey() {
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
  }

  async login() {
    throw new Error("Not implemented");
  }

  async getCurrentUser() {
    if (!this.ManagerActor) {
      throw new SessionInitializationError('ManagerActor not initialized. Call initialize() first.');
    }

    try {
      const result = await this.ManagerActor.getOrCreateUser();

      // Check if result contains an error
      if (result.err) {
        throw {
          message: result.err || "Failed to get current user",
          isApiError: true,
        };
      }

      const user = result.ok;

      console.log("Successfully obtained current user profile");
      return {
        id: user.principal.toString(),
        name: user.name,
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      if (error.isApiError) {
        throw error;
      }
      throw new SessionInitializationError('Failed to get current user', error);
    }
  }

  async initialize(agent) {
    if (!agent) {
      throw new SessionInitializationError('Agent is required for initialization');
    }

    try {
      this.AuthenticatedAgent = agent;

      await this.fetchRootKey();

      if (!GlobalSettings.session.icp.manager_canister_id) {
        throw new SessionInitializationError(
          "Manager canister ID is not configured"
        );
      }

      this.ManagerActor = Actor.createActor(ManagerIDLFactory, {
        canisterId: GlobalSettings.session.icp.manager_canister_id,
        agent: this.AuthenticatedAgent,
      });

      const user = await this.getCurrentUser();

      console.log("Successfully initialized session");

      return { user };
    } catch (error) {
      // Clean up resources if initialization fails
      this.AuthenticatedAgent = null;
      this.ManagerActor = null;

      if (error instanceof SessionInitializationError) {
        throw error;
      }

      throw new SessionInitializationError(
        "Failed to initialize session",
        error
      );
    }
  }

  async focus(vault) {
    // For now, we'll expect a manager actor to be initialized
    if (!this.ManagerActor) {
      throw new SessionInitializationError('ManagerActor not initialized. Call initialize() first.');
    }

    try {
      console.log(`Focusing on vault ${vault.canister_id}...`);

      await this.fetchRootKey();

      console.log(`Creating vault actor for ${vault.canister_id}...`);

      this.VaultActor = Actor.createActor(VaultIDLFactory, {
        canisterId: Principal.fromText(vault.canister_id),
        agent: this.AuthenticatedAgent,
      });

      // Store the focused vault
      this.FocusedVault = vault;

      console.log(`Vault ${vault.canister_id} focused successfully`);
      return { vault };
    } catch (error) {
      console.error('Error in focus:', error);
      throw new SessionInitializationError('Failed to focus vault', error);
    }
  }

  async getCurrentVault() {
    if (!this.FocusedVault) {
      throw new SessionInitializationError('No vault is currently focused');
    }
    return this.FocusedVault;
  }

  async fetchSession() {
    throw new Error("ICPSessionRepository does not support fetchSession");
  }

  async logout() {
    this.AuthenticatedAgent = null;
    this.VaultActor = null;
    this.ManagerActor = null;
    this.FocusedVault = null;
  }
}

decorate(injectable(), InMemorySessionRepository);
decorate(injectable(), ICPSessionRepository);

export const SESSION_REPOSITORY = Symbol.for("SESSION_REPOSITORY");
