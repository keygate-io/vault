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