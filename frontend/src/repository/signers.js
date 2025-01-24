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
  async getById(id) {
    throw new Error("Not implemented");
  }
  async create(signer) {
    throw new Error("Not implemented");
  }

  async createMany(signers) {
    throw new Error("Not implemented");
  }

  async update(id, signer) {
    throw new Error("Not implemented");
  }

  async delete(id) {
    throw new Error("Not implemented");
  }
}

// In-memory implementation of the repository
class InMemorySignerRepository extends SignerRepository {
  constructor(initialSigners = [], artificialDelay = 0) {
    super();
    this.signers = new Map();
    initialSigners.forEach((signer) => this.signers.set(signer.id, signer));
    this.artificialDelay = artificialDelay;
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
