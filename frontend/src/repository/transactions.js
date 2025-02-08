import { generateMockTransactionId } from "@/utils/mockDataGenerator";
import { GlobalSettings } from "@/constants/global_config";
import {
  generateMockTransactions,
  generateDefaultTransactionTraits,
} from "@/utils/mockDataGenerator";
import { getRandomMockedVaultId } from "../utils/mockDataGenerator";
import { injectable, inject, decorate } from "inversify";
import { SESSION_REPOSITORY } from "./session";
import { Principal } from "@dfinity/principal";
import { e8sToFloat } from "@/utils/floatPrecision";

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
export class InMemoryTransactionRepository extends TransactionRepository {
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

export class ICPTransactionRepository extends TransactionRepository {
  constructor(sessionRepository) {
    super();
    this.sessionRepository = sessionRepository;
  }

  async getAll() {
    const vaultActor = this.sessionRepository.VaultActor;
    const focusedVault = this.sessionRepository.FocusedVault;
    
    if (!vaultActor) {
      throw new Error("Vault actor not initialized");
    }

    if (!focusedVault) {
      throw new Error("No vault is currently focused");
    }

    try {
      const transactions = await vaultActor.getTransactions();
      console.log("Raw transactions result:", transactions);
      
      const formattedTransactions = transactions.map((tx) => ({
        id: tx.id.toString(),
        vault_id: focusedVault.canister_id,
        recipient: Principal.fromUint8Array(tx.transaction.to).toString(),
        amount: e8sToFloat(tx.transaction.amount),
        isExecuted: tx.executed,
        isSuccessful: tx.executed,
        confirmations: tx.confirmations,
        threshold: tx.threshold,
      }));

      console.log("Formatted transactions:", formattedTransactions);
      return formattedTransactions;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  async create(transaction) {
    const vaultActor = this.sessionRepository.VaultActor;
    const focusedVault = this.sessionRepository.FocusedVault;
    if (!vaultActor) {
      throw new Error("Vault actor not initialized");
    }

    if (!focusedVault) {
      throw new Error("No current focused vault");
    }

    try {
      console.log(transaction);

      const result = await vaultActor.proposeTransaction(Principal.fromText(transaction.recipient), transaction.amount.e8s);

      // Check if result contains an error
      if (result.err) {
        throw {
          message: result.err.message || "Failed to propose transaction",
          code: result.err.code,
          isApiError: true
        };
      }

      const tx = result.ok;

      console.log("Proposed transaction successfully");
      console.log("Result", tx);


      console.log("Transaction amount type:", typeof tx.amount);
      const parsedTx = {
        id: tx.id.toString(),
        vault_id: focusedVault.canister_id,
        recipient: Principal.fromUint8Array(tx.to).toString(),
        amount: e8sToFloat(tx.amount),
        created_at_time: tx.created_at_time.toString(),
        isExecuted: false,
        isSuccessful: false,
      };

      console.log("Parsed transaction", parsedTx);

      return parsedTx;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async execute(vault_id, transaction_id) {
    const managerActor = this.sessionRepository.ManagerActor;
    if (!managerActor) {
      throw new Error("Manager actor not initialized");
    }

    try {
      const result = await managerActor.executeTransaction(vault_id, BigInt(transaction_id));
      
      // Check if result contains an error
      if (result && result.err) {
        throw {
          message: result.err.message || "Failed to execute transaction",
          code: result.err.code,
          isApiError: true
        };
      }

      return {
        id: transaction_id,
        vault_id: vault_id,
        isExecuted: true,
        isSuccessful: true,
      };
    } catch (error) {
      console.error('Error in execute:', error);
      throw error;
    }
  }

  async getByStatus(vault_id, status) {
    const transactions = await this.getAll();
    
    return transactions.filter((tx) => {
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

decorate(injectable(), InMemoryTransactionRepository);
decorate(injectable(), ICPTransactionRepository);
decorate(inject(SESSION_REPOSITORY), ICPTransactionRepository, 0);

export const TRANSACTIONS_REPOSITORY = Symbol.for("TRANSACTIONS_REPOSITORY");
