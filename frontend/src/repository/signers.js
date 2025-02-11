import { GlobalSettings } from "@/constants/global_config";
import { generateMockSigners } from "@/utils/mockDataGenerator";
import { injectable, inject, decorate } from "inversify";
import { SESSION_REPOSITORY } from "./session";
import { faker } from "@faker-js/faker";

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
    console.log("Getting signers for vault", vault_id);
    console.log("Type of vault_id", typeof vault_id);

    const managerActor = this.sessionRepository.ManagerActor;
    const vaultActor = this.sessionRepository.VaultActor;

    if (!managerActor || !vaultActor) {
      throw new Error("Actors not initialized");
    }

    try {
      const signers = await managerActor.getOwners(Number(vault_id));
      const signers_2 = await vaultActor.getOwners();
      console.log("Signers obtained successfully");

      const signersFromManager = signers.ok.map((signer) => ({
        id: signer.principal.toString(),
        name: signer.name,
        avatarUrl: faker.image.avatarGitHub(),
      }));

      const commonNames = [
        "Alex",
        "Bob",
        "Charlie",
        "David",
        "Emma",
        "Frank",
        "Grace",
        "Henry",
        "Ivy",
        "Jack",
      ];

      const signersFromVault = signers_2.map((principal, index) => ({
        id: principal.toString(),
        name: commonNames[index % commonNames.length],
        avatarUrl: faker.image.avatarGitHub(),
      }));

      // Create a Map to deduplicate signers by their principal ID
      const uniqueSignersMap = new Map();

      // Add signers from manager first (they have priority for names)
      signersFromManager.forEach((signer) => {
        uniqueSignersMap.set(signer.id, signer);
      });

      // Add signers from vault only if they don't exist in manager
      signersFromVault.forEach((signer) => {
        if (!uniqueSignersMap.has(signer.id)) {
          uniqueSignersMap.set(signer.id, signer);
        }
      });

      console.log("uniqueSignersMap", uniqueSignersMap);

      return Array.from(uniqueSignersMap.values());
    } catch (error) {
      console.error("Error in getSignersByVaultId:", error);
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
