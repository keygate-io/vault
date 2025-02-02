import { generateMockTransactionId } from "@/utils/mockDataGenerator";
import { GlobalSettings } from "@/constants/global_config";
import {
  generateMockTransactions,
  generateDefaultTransactionTraits,
} from "@/utils/mockDataGenerator";
import { getRandomMockedVaultId } from "../utils/mockDataGenerator";

// Helper function to create a transaction object
export function createTransaction(params = {}) {
  const { id, recipient, amount, isSuccessful, isExecuted, vault_id } = params;

  return {
    id: id,
    vault_id: vault_id,
    recipient: recipient || "",
    amount: amount || 0,
    isExecuted: isExecuted || false,
    isSuccessful: isSuccessful || false,
  };
}

// Repository interface (abstract class)
export class TransactionRepository {
  async getAll(vault_id) {
    throw new Error("Not implemented");
  }

  async getByVaultId(vault_id) {
    throw new Error("Not implemented");
  }

  async getById(vault_id, id) {
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

  async execute(vault_id, transaction_id) {
    throw new Error("Not implemented");
  }
}

// Prepare mocked transactions
const mockedTransactions = generateMockTransactions();

// In-memory implementation of the repository
class InMemoryTransactionRepository extends TransactionRepository {
  constructor() {
    super();
    this.transactions = {}; // Object: vaultId -> transactionId -> Transaction
    if (GlobalSettings.transactions.source === "mock") {
      mockedTransactions.forEach((transaction) => {
        const tx = createTransaction(transaction);
        const vaultId = getRandomMockedVaultId();
        this.transactions[vaultId] = {
          ...this.transactions[vaultId],
          [transaction.id]: tx,
        };
      });
    }
  }

  async getAllTxsForVaultId(vault_id) {
    const txs = Object.values(this.transactions[vault_id] || {});
    return txs;
  }

  async getById(vault_id, id) {
    return this.transactions[vault_id][id] || null;
  }

  async create(vault_id, transaction) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const id = generateMockTransactionId();
    const defaultTraits = generateDefaultTransactionTraits();
    const newTx = createTransaction({
      ...transaction,
      id,
      vault_id: vault_id,
      ...defaultTraits,
    });
    this.transactions[vault_id][id] = newTx;
    return newTx;
  }

  async createMany(vault_id, transactions) {
    transactions.forEach((tx) => {
      this.transactions[vault_id][tx.id] = createTransaction({
        ...tx,
        vault_id: vault_id,
      });
    });
    return transactions.map((tx) => this.transactions[tx.id]);
  }

  async update(vaultId, txId, transaction) {
    const currentTx = this.transactions[txId];
    if (!currentTx || currentTx.vault_id !== vaultId) return null;
    const updatedTx = createTransaction({
      ...currentTx,
      ...transaction,
      vault_id: currentTx.vault_id,
      id: txId,
    });
    this.transactions[txId] = updatedTx;
    return updatedTx;
  }

  async delete(vaultId, txId) {
    const tx = this.transactions[txId];
    if (!tx || tx.vault_id !== vaultId) return false;
    delete this.transactions[txId];
    return true;
  }

  async execute(vault_id, tx_id) {
    const tx = this.transactions[vault_id][tx_id];

    await new Promise((resolve) => setTimeout(resolve, 3000));

    this.transactions[vault_id][tx_id] = {
      ...tx,
      isExecuted: true,
      isSuccessful: true,
    };

    return this.transactions[vault_id][tx_id];
  }

  async getByStatus(vault_id, status) {
    const validStatuses = ["pending", "executed", "failed"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    return Object.values(this.transactions)
      .filter((tx) => tx.vault_id === vault_id)
      .filter((tx) => {
        switch (status) {
          case "pending":
            return !tx.isExecuted;
          case "executed":
            return tx.isExecuted && tx.isSuccessful;
          case "failed":
            return !tx.isSuccessful;
          default:
            return false;
        }
      });
  }
}

export { InMemoryTransactionRepository };
