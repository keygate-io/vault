import { injectable, inject, decorate } from "inversify";
import { SESSION_REPOSITORY } from "./session";
import { Principal } from "@dfinity/principal";

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

export class ICPDecisionRepository extends DecisionRepository {
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
      const owners = await vaultActor.getOwners();

      // Create a decisions map for the focused vault
      const decisions_map = {};
      decisions_map[focusedVault.id] = {};

      // For each transaction, create an array of [userId, isApproval] pairs
      transactions.forEach((tx) => {
        console.log("tx", tx);
        const txId = tx.id.toString();
        const confirmedOwners = new Set(
          tx.decisions
            .filter(([_, isApproved]) => isApproved)
            .map(([owner]) => owner.toString())
        );

        // Map each owner to a decision pair [userId, isApproval]
        const decisions = owners.map((owner) => [
          owner.toString(),
          confirmedOwners.has(owner.toString()),
        ]);

        decisions_map[focusedVault.id][txId] = decisions;
      });

      console.log("decisions_map", decisions_map);

      return decisions_map;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  }

  async getByTransactionId(vaultId, txId) {
    const vaultActor = this.sessionRepository.VaultActor;
    if (!vaultActor) {
      throw new Error("Vault actor not initialized");
    }

    try {
      const result = await vaultActor.getTransactionDetails(BigInt(txId));

      if (result.err) {
        const error = new Error(
          result.err.message || "Failed to get transaction details"
        );
        error.code = result.err.code;
        error.isApiError = true;
        throw error;
      }

      const owners = await vaultActor.getOwners();
      console.log("owners", owners);

      // Return array of [userId, decision] pairs based on confirmations
      return owners.map((owner) => [
        owner.toString(),
        false, // Default to false, will be updated below if confirmed
      ]);
    } catch (error) {
      console.error("Error in getByTransactionId:", error);
      throw error;
    }
  }

  async recordDecision(vaultId, txId, decision, userId) {
    const vaultActor = this.sessionRepository.VaultActor;
    if (!vaultActor) {
      throw new Error("Vault actor not initialized");
    }

    try {
      if (decision) {
        // If decision is true (approval), call confirmTransaction
        const result = await vaultActor.confirmTransaction(BigInt(txId));

        if (result.err) {
          throw {
            message: result.err.message || "Failed to confirm transaction",
            code: result.err.code,
            isApiError: true,
          };
        }
      }
      // Note: The Vault contract doesn't support explicit rejection,
      // so we only handle confirmations (approvals)

      // Return updated transaction details
      const updatedDetails = await vaultActor.getTransactionDetails(
        BigInt(txId)
      );
      if (updatedDetails.err) {
        throw {
          message:
            updatedDetails.err.message ||
            "Failed to get updated transaction details",
          code: updatedDetails.err.code,
          isApiError: true,
        };
      }

      return updatedDetails.ok;
    } catch (error) {
      console.error("Error in recordDecision:", error);
      throw error;
    }
  }
}

decorate(injectable(), InMemoryDecisionRepository);
decorate(injectable(), ICPDecisionRepository);
decorate(inject(SESSION_REPOSITORY), ICPDecisionRepository, 0);

export const DECISIONS_REPOSITORY = Symbol.for("DECISIONS_REPOSITORY");
