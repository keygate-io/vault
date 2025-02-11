import { injectable, inject, decorate } from "inversify";
import { SESSION_REPOSITORY } from "./session";
import { Principal } from "@dfinity/principal";

export class ICPInvitationRepository {
  constructor(sessionRepository) {
    this.sessionRepository = sessionRepository;
  }

  async invite(vaultId, principalId) {
    try {
      const vaultActor = this.sessionRepository.VaultActor;
      if (!vaultActor) {
        throw new Error("Vault actor not focused");
      }

      const principal = Principal.fromText(principalId);
      const action = { Invite: principal };

      const result = await vaultActor.propose(action);

      if ("err" in result) {
        throw new Error(
          result.err.message || "Failed to create invite proposal"
        );
      }

      return {
        id: result.ok.id.toString(),
        created_at_time: result.ok.created_at_time.toString(),
        decisions: result.ok.decisions.map((decision) => ({
          ...decision,
          0: decision[0].toString(),
        })),
        executed: result.ok.executed,
        invitee: result.ok.action.Invite.toText(),
        threshold: Number(result.ok.threshold),
        required: Number(result.ok.required),
      };
    } catch (error) {
      console.error("Error inviting signer:", error);
      throw error;
    }
  }

  async getInvitations() {
    const vaultActor = this.sessionRepository.VaultActor;

    if (!vaultActor) {
      throw new Error("Vault actor not initialized");
    }

    try {
      const invitations = await vaultActor.getInvitations();

      // Transform the data into a serializable format
      const serializedInvitations = invitations.map((invitation) => ({
        id: Number(invitation.id), // Convert bigint to number
        created_at_time: Number(invitation.created_at_time), // Convert bigint to number
        decisions: invitation.decisions.map((decision) => ({
          ...decision,
          0: decision[0].toString(),
        })),
        executed: invitation.executed,
        invitee: invitation.action.Invite.toText(), // Convert Principal to string
        required: Number(invitation.required), // Convert bigint to number if needed
        threshold: Number(invitation.threshold), // Convert bigint to number if needed
      }));

      console.log("Invitations obtained succesfully");
      return serializedInvitations;
    } catch (error) {
      console.error("Error in getInvitations:", error);
      throw error;
    }
  }

  async execute(invitation_id) {
    const vaultActor = this.sessionRepository.VaultActor;
    if (!vaultActor) {
      throw new Error("Vault actor not initialized");
    }

    try {
      const result = await vaultActor.executeProposal(BigInt(invitation_id));

      // Check if result contains an error
      if (result && result.err) {
        throw {
          message: result.err.message || "Failed to execute invitation",
          code: result.err.code,
          isApiError: true,
        };
      }

      console.log("Executed invitation:", result.ok);

      return {
        id: Number(invitation_id),
        executed: true,
      };
    } catch (error) {
      console.error("Error in executeInvitation:", error);
      throw error;
    }
  }
}

decorate(injectable(), ICPInvitationRepository);
decorate(inject(SESSION_REPOSITORY), ICPInvitationRepository, 0);

export const INVITATIONS_REPOSITORY = Symbol.for("INVITATIONS_REPOSITORY");
