import { GlobalSettings } from "@/constants/global_config";
import { generateMockSigners } from "@/utils/mockDataGenerator";

// Repository interface (abstract class)
export class SignerRepository {
  async getSignersByVaultId(vault_id) {
    throw new Error("Not implemented");
  }

  async addSignerToVault(vault_id, signer_id) {
    throw new Error("Not implemented");
  }

  async removeSignerFromVault(vault_id, signer_id) {
    throw new Error("Not implemented");
  }
}

// In-memory implementation of the repository
// vault_ids[] -> user_id[]
class InMemorySignerRepository extends SignerRepository {
  constructor() {
    super();
    // key is vault_id, value is a array of signer_ids (number)
    this.vault_ids_to_signer_ids = {};

    if (GlobalSettings.signers.source === "mock") {
      const mockedSigners = generateMockSigners();
      this.vault_ids_to_signer_ids = mockedSigners;
    }
  }

  async getSignersByVaultId(vault_id) {
    return this.vault_ids_to_signer_ids[vault_id] || [];
  }

  async addSignerToVault(vault_id, signer_id) {
    const existingSigners = this.vault_ids_to_signer_ids[vault_id] || [];
    this.vault_ids_to_signer_ids[vault_id] = [...existingSigners, signer_id];
    return this.vault_ids_to_signer_ids;
  }

  async removeSignerFromVault(vault_id, signer_id) {
    const existingSigners = this.vault_ids_to_signer_ids[vault_id] || [];
    this.vault_ids_to_signer_ids[vault_id] = existingSigners.filter(
      (id) => id !== signer_id
    );
    return this.vault_ids_to_signer_ids;
  }
}

// Create and export a default instance

export { InMemorySignerRepository };
