// Repository interface, abstract class
class DecisionRepository {
  async getAll() {
    throw new Error("Not implemented");
  }

  async getByTransactionId(vaultId, txId) {
    throw new Error("Not implemented");
  }

  async recordDecision(vaultId, txId, decision, userId) {
    throw new Error("Not implemented");
  }
}

// In-memory implementation
export class InMemoryDecisionRepository extends DecisionRepository {
  constructor() {
    super();
    // Structure: { [vaultId]: { [txId]: Array<[userId, isApproval]> } }
    this.decisions = {};
  }

  async getAll() {
    return this.decisions;
  }

  async getByTransactionId(vaultId, txId) {
    return this.decisions[vaultId]?.[txId] || [];
  }

  async recordDecision(vaultId, txId, decision, userId) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

    // Initialize vault if not exists
    if (!this.decisions[vaultId]) {
      this.decisions[vaultId] = {};
    }

    // Initialize transaction array if not exists
    if (!this.decisions[vaultId][txId]) {
      this.decisions[vaultId][txId] = [];
    }

    // Add new decision
    this.decisions[vaultId][txId].push([userId, decision]);

    return structuredClone(this.decisions); // Return cloned state to avoid reference issues
  }
}
