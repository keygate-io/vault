import { GlobalSettings } from "@/constants/global_config";
import { generateMockSigners } from "@/utils/mockDataGenerator";

// Signer model/type definition
export class Signer {
  constructor(id, name, avatarUrl, isCurrentUser = false) {
    this.id = id;
    this.name = name;
    this.avatarUrl = avatarUrl;
    this.isCurrentUser = isCurrentUser;
  }
}

// Repository interface (abstract class)
export class SignerRepository {
  async getAll() {
    throw new Error("Not implemented");
  }
  // eslint-disable-next-line no-unused-vars
  async getById(id) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async create(signer) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async createMany(signers) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async update(id, signer) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async delete(id) {
    throw new Error("Not implemented");
  }
}

// Prepare mocked signers
const mockedSigners = generateMockSigners();

// In-memory implementation of the repository
class InMemorySignerRepository extends SignerRepository {
  constructor(initialSigners = []) {
    super();
    this.signers = new Map();

    if (GlobalSettings.signers.source === "mock") {
      initialSigners = mockedSigners;
    }

    initialSigners.forEach((signer) => this.signers.set(signer.id, signer));
  }

  async getAll() {
    return Array.from(this.signers.values());
  }

  async getById(id) {
    return this.signers.get(id);
  }

  async create(signer) {
    this.signers.set(signer.id, signer);
    return signer;
  }

  async createMany(signers) {
    signers.forEach((signer) => this.signers.set(signer.id, signer));
  }

  async update(id, signer) {
    if (!this.signers.has(id)) return null;
    this.signers.set(id, { ...signer, id });
    return this.signers.get(id);
  }

  async delete(id) {
    return this.signers.delete(id);
  }
}

// Create and export a default instance

export { InMemorySignerRepository };
