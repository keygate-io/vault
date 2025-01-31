import { getMockedCurrentUser } from "@/utils/mockDataGenerator";
import { getMockedCurrentVault } from "@/utils/mockDataGenerator";
import { Actor } from "@dfinity/agent";
import { idlFactory as VaultIDLFactory } from "../../idl/vault";
import { idlFactory as ManagerIDLFactory } from "../../idl/manager";
import { GlobalSettings } from "@/constants/global_config";
import { injectable } from "inversify";

// Repository interface
export class ISessionRepository {
  async login() {
    throw new Error('Method not implemented');
  }
  async getCurrentUser() {
    throw new Error('Method not implemented');
  }
  async getCurrentVault() {
    throw new Error('Method not implemented');
  }
  async fetchSession() {
    throw new Error('Method not implemented');
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
    throw new Error("InMemorySessionRepository does not support setting an authenticated agent");
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

@injectable()
export class ICPSessionRepository extends ISessionRepository {
  constructor() {
    super();
    this.AuthenticatedAgent = null;
    this.VaultActor = null;
    this.ManagerActor = null;
    console.log("Initializing ICPSessionRepository");
  }

  async login() {
    throw new Error("Not implemented");
  }

  async getCurrentUser() {
    return this.ManagerActor.getUser();
  }

  async initializeVault(vaultCanisterId) {
    this.VaultActor = Actor.createActor(
      VaultIDLFactory,
      {
        canisterId: vaultCanisterId,
        agent: this.AuthenticatedAgent,
      }
    );
  }

  async initializeManager() {
    this.ManagerActor = Actor.createActor(
      ManagerIDLFactory,
      {
        canisterId: GlobalSettings.session.icp.manager_canister_id,
        agent: this.AuthenticatedAgent,
      }
    );
  }

  async setAuthenticatedAgent(agent) {
    this.AuthenticatedAgent = agent;
    
    // Initialize Manager Actor
    this.ManagerActor = Actor.createActor(ManagerIDLFactory, {
      agent,
      canisterId: GlobalSettings.session.icp.manager_canister_id
    });
    
    // Get user's vault ID from manager canister
    const vaultResponse = await this.ManagerActor.getVault(0n); // Use proper vault index
    if (vaultResponse && vaultResponse.length > 0) {
      await this.initializeVault(vaultResponse[0].canister_id);
    }
  }

  async getCurrentVault() {
    throw new Error("ICPSessionRepository does not support getCurrentVault");
  }

  async fetchSession() {
    throw new Error("ICPSessionRepository does not support fetchSession");
  }
}

inversify.decorate(inversify.injectable(), InMemorySessionRepository);
inversify.decorate(inversify.injectable(), ICPSessionRepository); 