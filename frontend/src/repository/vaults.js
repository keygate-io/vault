import { generateMockVaults } from "@/utils/mockDataGenerator";
import { GlobalSettings } from "@/constants/global_config";
import { injectable, inject, decorate } from "inversify";
import { SESSION_REPOSITORY } from "./session";

// Helper function to create a vault object
export function createVault(params = {}) {
  const { balance, threshold } = params;

  if (balance === undefined) {
    console.warn(
      "Vault initialisation is missing required parameters. This could lead to unexpected behaviour."
    );
  }

  return {
    balance: balance || 0,
    threshold: threshold || 1,
  };
}

let mockedVaults = generateMockVaults(GlobalSettings.vaults.mock_vaults);

// In-memory implementation of the repository
export class InMemoryVaultRepository {
  constructor() {
    if (GlobalSettings.vaults.source === "mock") {
      this.vaults = mockedVaults;
    }
  }

  async getById(vaultId) {
    const vault = this.vaults[vaultId];
    return vault;
  }

  async getAll() {
    return this.vaults;
  }

  async update(vaultId, vaultData) {
    this.vaults.set(vaultId, vaultData);
  }
}

export class ICPVaultsRepository {
  constructor(sessionRepository) {
    this.sessionRepository = sessionRepository;
  }

  async getAll() {
    const managerActor = this.sessionRepository.ManagerActor;
    if (!managerActor) {
      throw new Error("Manager actor not initialized");
    }

    const vaults = await managerActor.getVaults();
    const mapped_vaults = vaults.reduce((acc, vault, index) => {
      acc[index] = {
        id: index,
        name: vault.name,
        canister_id: vault.canister_id.toString(),
      };
      return acc;
    }, {});
    console.log("Vaults obtained successfully");
    return mapped_vaults;
  }
}

decorate(injectable(), ICPVaultsRepository);
decorate(inject(SESSION_REPOSITORY), ICPVaultsRepository, 0);

export const VAULTS_REPOSITORY = Symbol("VAULTS_REPOSITORY");
