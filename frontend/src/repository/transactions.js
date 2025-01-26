import { generateMockTransactionId } from "@/utils/mockDataGenerator";
import { GlobalSettings } from "@/constants/global_config";
import {
  generateMockTransactions,
  generateDefaultTransactionTraits,
} from "@/utils/mockDataGenerator";

// @SuppressWarnings("javascript:S2094")
export class Transaction {
  constructor(params = {}) {
    const { id, recipient, amount, isSuccessful, isExecuted, vault_id } =
      params;

    if (
      !id ||
      !recipient ||
      !vault_id ||
      isSuccessful === undefined ||
      isExecuted === undefined ||
      amount === undefined
    ) {
      console.warn(
        "Transaction initialisation is missing required parameters. This could lead to unexpected behaviour."
      );
    }

    this.id = id;
    this.vault_id = vault_id;
    this.recipient = recipient || "";
    this.amount = amount || 0;
    this.isExecuted = isExecuted || false;
    this.isSuccessful = isSuccessful || false;
  }
}

// Repository interface (abstract class)
export class TransactionRepository {
  async getAll() {
    throw new Error("Not implemented");
  }

  async getByVaultId(vault_id) {
    throw new Error("Not implemented");
  }

  async getById(id) {
    throw new Error("Not implemented");
  }

  async create(vault_id, transaction) {
    throw new Error("Not implemented");
  }

  async createMany(vault_id, transactions) {
    throw new Error("Not implemented");
  }

  async update(vault_id, transaction_id, transaction) {
    throw new Error("Not implemented");
  }

  async delete(vault_id, transaction_id) {
    throw new Error("Not implemented");
  }

  async getByStatus(vault_id, status) {
    throw new Error("Not implemented");
  }
}

// Prepare mocked transactions
const mockedTransactions = generateMockTransactions();

// In-memory implementation of the repository
class InMemoryTransactionRepository extends TransactionRepository {
  constructor() {
    super();
    // key is vault_id, value is a Map of transaction_id -> transaction
    this.vault_transactions = new Map();

    if (GlobalSettings.transactions.source === "mock") {
      // Group mocked transactions by vault_id
      mockedTransactions.forEach((transaction) => {
        const vault_id = transaction.vault_id;
        if (!this.vault_transactions.has(vault_id)) {
          this.vault_transactions.set(vault_id, new Map());
        }
        this.vault_transactions.get(vault_id).set(transaction.id, transaction);
      });
    }
  }

  async getAll() {
    const allTransactions = [];
    for (const transactionMap of this.vault_transactions.values()) {
      allTransactions.push(...transactionMap.values());
    }
    return allTransactions;
  }

  async getByVaultId(vault_id) {
    const vaultTransactions = this.vault_transactions.get(vault_id);
    return vaultTransactions ? Array.from(vaultTransactions.values()) : [];
  }

  async getById(id) {
    for (const transactionMap of this.vault_transactions.values()) {
      const transaction = transactionMap.get(id);
      if (transaction) return transaction;
    }
    return null;
  }

  async create(vault_id, transaction) {
    const id = generateMockTransactionId();
    const defaultTraits = generateDefaultTransactionTraits();

    // Simulate creation request to external service
    await setTimeout(() => {}, 4000);

    let materializedTransaction = new Transaction({
      ...transaction,
      id,
      vault_id,
      ...defaultTraits,
    });

    if (!this.vault_transactions.has(vault_id)) {
      this.vault_transactions.set(vault_id, new Map());
    }
    this.vault_transactions.get(vault_id).set(id, materializedTransaction);

    return materializedTransaction;
  }

  async createMany(vault_id, transactions) {
    if (!this.vault_transactions.has(vault_id)) {
      this.vault_transactions.set(vault_id, new Map());
    }

    transactions.forEach((transaction) => {
      const materializedTransaction = new Transaction({
        ...transaction,
        vault_id,
      });
      this.vault_transactions
        .get(vault_id)
        .set(transaction.id, materializedTransaction);
    });
  }

  async update(vault_id, transaction_id, transaction) {
    const vaultTransactions = this.vault_transactions.get(vault_id);
    if (!vaultTransactions || !vaultTransactions.has(transaction_id))
      return null;

    const updatedTransaction = new Transaction({
      ...transaction,
      id: transaction_id,
      vault_id,
    });
    vaultTransactions.set(transaction_id, updatedTransaction);
    return updatedTransaction;
  }

  async delete(vault_id, transaction_id) {
    const vaultTransactions = this.vault_transactions.get(vault_id);
    if (!vaultTransactions) return false;
    return vaultTransactions.delete(transaction_id);
  }

  async getByStatus(vault_id, targetStatus) {
    if (!["under review", "approved", "rejected"].includes(targetStatus)) {
      throw new Error("Invalid status");
    }

    const vaultTransactions = await this.getByVaultId(vault_id);

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

    return extractByStatus(vaultTransactions);
  }
}

export { InMemoryTransactionRepository };
