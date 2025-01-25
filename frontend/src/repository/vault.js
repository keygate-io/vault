import { generateMockVault } from "@/utils/mockDataGenerator";

// Helper function to create a vault object
export function createVault(params = {}) {
  const { balance } = params;

  if (balance === undefined) {
    console.warn(
      "Vault initialisation is missing required parameters. This could lead to unexpected behaviour."
    );
  }

  return {
    balance: balance || 0,
  };
}

// Repository interface (abstract class)
export class VaultRepository {
  async get() {
    throw new Error("Not implemented");
  }

  async update(vaultData) {
    throw new Error("Not implemented");
  }
}

// In-memory implementation of the repository
export class InMemoryVaultRepository extends VaultRepository {
  constructor(initialVault = null) {
    super();
    this.vault = initialVault || generateMockVault(); // Mock initial balance
  }

  async get() {
    return { ...this.vault }; // Return a copy of the plain object
  }

  async update(vaultData) {
    this.vault = { ...vaultData }; // Store a copy of the plain object
    return { ...this.vault }; // Return a copy of the plain object
  }
}
