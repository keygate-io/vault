import { generateMockVaults } from "@/utils/mockDataGenerator";
import { GlobalSettings } from "@/constants/global_config";
import { injectable, inject, decorate } from "inversify";
import { SESSION_REPOSITORY } from "./session";
import { idlFactory as IcpLedgerIDLFactory } from "../../idl/icp_ledger_canister/icp_ledger_canister.did.js";
import { Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { e8sToFloat } from "@/utils/floatPrecision";
import { AccountIdentifier } from "@dfinity/ledger-icp";

// Helper function to create a vault object
export function createVault(params = {}) {
  const { balance, threshold } = params;

  if (balance === undefined) {
    console.warn(
      "Vault initialisation is missing required parameters. This could lead to unexpected behaviour."
    );
  }

  return {
    balance: balance || 0,
    threshold: threshold || 1,
  };
}

let mockedVaults = generateMockVaults(GlobalSettings.vaults.mock_vaults);

// In-memory implementation of the repository
export class InMemoryVaultRepository {
  constructor() {
    if (GlobalSettings.vaults.source === "mock") {
      this.vaults = mockedVaults;
    }
  }

  async getById(vaultId) {
    const vault = this.vaults[vaultId];
    return vault;
  }

  async getAll() {
    return this.vaults;
  }

  async update(vaultId, vaultData) {
    this.vaults.set(vaultId, vaultData);
  }
}

export class ICPVaultsRepository {
  constructor(sessionRepository) {
    this.sessionRepository = sessionRepository;
  }

  async getAll() {
    const managerActor = this.sessionRepository.ManagerActor;
    if (!managerActor) {
      throw new Error("Manager actor not initialized");
    }

    const vaults = await managerActor.getVaults();
    const mapped_vaults = vaults.reduce((acc, vault, index) => {
      acc[index] = {
        id: index,
        name: vault.name,
        canister_id: vault.canister_id.toString(),
      };
      return acc;
    }, {});
    console.log("Vaults obtained successfully");
    return mapped_vaults;
  }

  async create({ name }) {
    const managerActor = this.sessionRepository.ManagerActor;
    if (!managerActor) {
      throw new Error("Manager actor not initialized");
    }

    const result = await managerActor.createVault(name);

    if (result.err) {
      const error = new Error(result.err);
      error.isApiError = true;
      throw error;
    }

    const vault = result.ok;
    // Map the response to match our frontend model
    return {
      id: Object.keys(await this.getAll()).length - 1, // Get the next available ID
      name: vault.name,
      canister_id: vault.canister_id.toString(),
    };
  }

  async getBalance() {
    const focusedVault = this.sessionRepository.FocusedVault;
    if (!focusedVault) {
      throw new Error("No vault is currently focused");
    }

    if (!this.sessionRepository.AuthenticatedAgent) {
      throw new Error("No authenticated agent available");
    }

    try {
      const ledgerActor = Actor.createActor(IcpLedgerIDLFactory, {
        canisterId: GlobalSettings.session.icp.ledger_canister_id,
        agent: this.sessionRepository.AuthenticatedAgent,
      });

      const principal = Principal.fromText(focusedVault.canister_id);

      const account = AccountIdentifier.fromPrincipal({
        principal,
        subaccount: [],
      }).toUint8Array();

      // Get the balance using the vault's canister ID as the account
      const balance = await ledgerActor.account_balance({ account });

      const balance_float = e8sToFloat(balance.e8s);

      // Convert e8s to ICP float value
      return balance_float;
    } catch (error) {
      console.error("Error getting vault balance:", error);
      throw error;
    }
  }
}

decorate(injectable(), ICPVaultsRepository);
decorate(inject(SESSION_REPOSITORY), ICPVaultsRepository, 0);

export const VAULTS_REPOSITORY = Symbol("VAULTS_REPOSITORY");
