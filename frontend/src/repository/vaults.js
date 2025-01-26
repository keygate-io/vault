import { generateMockVaults } from "@/utils/mockDataGenerator";
import { GlobalSettings } from "@/constants/global_config";

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

// Repository interface (abstract class)
export class VaultRepository {
  async getById(vaultId) {
    throw new Error("Not implemented");
  }

  async getAll() {
    throw new Error("Not implemented");
  }

  async update(vaultId, vaultData) {
    throw new Error("Not implemented");
  }
}

// In-memory implementation of the repository
export class InMemoryVaultRepository extends VaultRepository {
  constructor() {
    super();
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
