import { GlobalSettings } from "@/constants/global_config";
import { generateMockSigners } from "@/utils/mockDataGenerator";
import { injectable, inject, decorate } from "inversify";
import { SESSION_REPOSITORY } from "./session";

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

class ICPSignerRepository extends SignerRepository {
  constructor(sessionRepository) {
    super();
    this.sessionRepository = sessionRepository;
  }

  async getSignersByVaultId(vault_id) {
    const managerActor = this.sessionRepository.ManagerActor;
    if (!managerActor) {
      throw new Error("Manager actor not initialized");
    }

    try {
      const signers = await managerActor.getSigners(vault_id);
      console.log("Signers obtained successfully");
      return signers.map((signer) => ({
        id: signer.id.toString(),
        name: signer.name,
      }));
    } catch (error) {
      console.error('Error in getSignersByVaultId:', error);
      throw error;
    }
  }
}

// Create and export a default instance
const SIGNER_REPOSITORY = Symbol.for("SIGNER_REPOSITORY");

decorate(injectable(), InMemorySignerRepository);
decorate(injectable(), ICPSignerRepository);
decorate(inject(SESSION_REPOSITORY), ICPSignerRepository, 0);

export { InMemorySignerRepository, ICPSignerRepository, SIGNER_REPOSITORY };
