import { getMockedCurrentUser } from "@/utils/mockDataGenerator";
import { GlobalSettings } from "@/constants/global_config";

// Repository interface
export class DecisionRepository {
  async getAll() {
    throw new Error("Not implemented");
  }

  async getByTransactionId(txId) {
    throw new Error("Not implemented");
  }

  async recordDecision(txId, isApproval) {
    throw new Error("Not implemented");
  }
}

function serializeMap(map) {
  const obj = {};
  for (const [key, value] of map.entries()) {
    obj[key] = value;
  }
  return obj;
}

// In-memory implementation
export class InMemoryDecisionRepository extends DecisionRepository {
  constructor() {
    super();
    this.decisions = new Map();
  }

  async getAll() {
    return serializeMap(this.decisions);
  }

  async getByTransactionId(txId) {
    return this.decisions.get(txId) || [];
  }

  async recordDecision(txId, isApproval = true) {
    await setTimeout(() => {}, 2000); // Simulate network delay

    let currentSigner = getMockedCurrentUser();
    let signerId = currentSigner.id;

    let existingDecisions = this.decisions.get(txId) || [];
    let newDecisions = [...existingDecisions, [signerId, isApproval]];

    this.decisions.set(txId, newDecisions);

    return serializeMap(this.decisions);
  }
}
