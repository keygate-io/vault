import { generateMockTransactionId } from "@/utils/mockDataGenerator";
import { GlobalSettings } from "@/constants/global_config";
import {
  generateMockTransactions,
  generateDefaultTransactionTraits,
} from "@/utils/mockDataGenerator";
import { getMockedCurrentUser } from "@/utils/mockDataGenerator";

// @SuppressWarnings("javascript:S2094")
export class Transaction {
  constructor(params = {}) {
    const { id, recipient, amount, isSuccessful, isExecuted } = params;

    if (
      !id ||
      !recipient ||
      isSuccessful === undefined ||
      isExecuted === undefined ||
      amount === undefined
    ) {
      console.warn(
        "Transaction initialisation is missing required parameters. This could lead to unexpected behaviour."
      );
    }

    this.id = id;
    this.recipient = recipient || "";
    this.amount = amount || 0;
    this.approvals = params.approvals || 0;
    this.isExecuted = isExecuted || false;
    this.isSuccessful = isSuccessful || false;
  }
}

// Repository interface (abstract class)
export class TransactionRepository {
  async getAll() {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async getById(id) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async create(transaction) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async createMany(transactions) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async update(id, transaction) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async delete(id) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async getByStatus(status) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async approve(id) {
    throw new Error("Not implemented");
  }
}

// Prepare mocked transactions
const mockedTransactions = generateMockTransactions();

// In-memory implementation of the repository
class InMemoryTransactionRepository extends TransactionRepository {
  constructor(initialTransactions = []) {
    super();
    this.transactions = new Map();
    this.approvals = new Map();

    if (GlobalSettings.transactions.source === "mock") {
      initialTransactions = mockedTransactions;
    }

    initialTransactions.forEach((transaction) =>
      this.transactions.set(transaction.id, transaction)
    );
  }

  async getAll() {
    return Array.from(this.transactions.values());
  }

  async getById(id) {
    return this.transactions.get(id);
  }

  async create(transaction) {
    const id = generateMockTransactionId();
    const defaultTraits = generateDefaultTransactionTraits();

    // Simulate creation request to external service (by timing out)
    await setTimeout(() => {}, 4000);

    let materializedTransaction = { ...transaction, id, ...defaultTraits };
    this.transactions.set(id, materializedTransaction);

    return materializedTransaction;
  }

  async createMany(transactions) {
    transactions.forEach((transaction) =>
      this.transactions.set(transaction.id, transaction)
    );
  }

  async update(id, transaction) {
    if (!this.transactions.has(id)) return null;
    this.transactions.set(id, { ...transaction, id });
    return this.transactions.get(id);
  }

  async delete(id) {
    return this.transactions.delete(id);
  }

  async approve(txId) {
    await setTimeout(() => {}, 4000);

    let currentSigner = getMockedCurrentUser();
    let signerId = currentSigner.id;

    let existingApprovals = this.approvals.get(txId) || [];
    let newApprovals = [...existingApprovals, [signerId, true]];

    this.approvals.set(txId, newApprovals);

    return serializeMap(this.approvals);
  }

  async getByStatus(targetStatus) {
    if (!["under review", "approved", "rejected"].includes(targetStatus)) {
      throw new Error("Invalid status");
    }

    function extractByStatus(transactions) {
      switch (targetStatus) {
        case "pending":
          return transactions.filter(
            (transaction) => transaction.isExecuted === false
          );
        case "executed":
          return transactions.filter(
            (transaction) =>
              transaction.isExecuted === true &&
              transaction.isSuccessful === true
          );
        case "failed":
          return transactions.filter(
            (transaction) => transaction.isSuccessful === false
          );
        default:
          console.warn(
            `Unknown status: ${targetStatus}. Returning all transactions. This could lead to unexpected behaviour.`
          );

          return transactions;
      }
    }

    return extractByStatus(this.transactions);
  }
}

export { InMemoryTransactionRepository };
