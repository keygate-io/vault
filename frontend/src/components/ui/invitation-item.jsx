import { HStack, VStack, Button, Box, Text } from "@chakra-ui/react";
import { CheckCircleIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import AddressDisplay from "@/components/ui/address-display";
import ApprovalGrid from "@/components/ui/approval-grid";
import { SentimentTransactionBadge } from "@/components/ui/transaction-badge";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  recordDecision,
  hasUserApprovedThisProposal,
  selectApprovalsCount,
  isTransactionLoading,
} from "@/state/decisions_slice";
import { selectVaultThreshold } from "@/state/vaults_slice";
import { selectCurrentUser } from "@/state/session_slice";
import {
  selectVaultSigners,
  fetchSignersForVault,
} from "@/state/signers_slice";
import { selectUsersByIdArray } from "@/state/users_slice";
import {
  executeInvitation,
  selectInvitationExecutionLoading,
} from "@/state/invitations_slice";
import { selectApprovers, selectRejectors } from "@/state/decisions_slice";

const ActionExecuteButton = ({ invitation }) => {
  const dispatch = useDispatch();
  const { vaultId } = useParams();

  const approvals = useSelector((state) =>
    selectApprovalsCount(state, vaultId, invitation.id)
  );

  const threshold = useSelector((state) =>
    selectVaultThreshold(state, vaultId)
  );

  const signers = useSelector((state) => selectVaultSigners(state, vaultId));

  const adjustedThreshold = Math.min(threshold, signers.length);

  const isExecuting = useSelector((state) =>
    selectInvitationExecutionLoading(state, invitation.id)
  );

  const handleExecute = async () => {
    try {
      await dispatch(
        executeInvitation({ vaultId: vaultId, invitationId: invitation.id })
      ).unwrap();
      console.log("Fetching signers for vault", vaultId);
      await dispatch(fetchSignersForVault(vaultId));
    } catch (error) {
      console.error("Error executing invitation:", error);
    }
  };

  return (
    <Button
      variant={approvals >= adjustedThreshold ? "solid" : "outline"}
      colorScheme={approvals >= adjustedThreshold ? "green" : "blue"}
      disabled={approvals < adjustedThreshold || isExecuting}
      size="xs"
      onClick={handleExecute}
      loading={isExecuting}
      loadingText="Executing..."
    >
      Execute
    </Button>
  );
};

ActionExecuteButton.propTypes = {
  invitation: PropTypes.object.isRequired,
};

const ActionApproveButton = ({ invitationId, vaultId }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) =>
    isTransactionLoading(state, invitationId)
  );
  const currentUser = useSelector((state) => selectCurrentUser(state));
  const hasApproved = useSelector((state) =>
    hasUserApprovedThisProposal(state, vaultId, invitationId, currentUser?.id)
  );

  const handleApprove = () => {
    dispatch(
      recordDecision({
        vaultId,
        transactionId: invitationId,
        isApproval: true,
      })
    );
  };

  if (hasApproved) {
    return (
      <Button variant="ghost" size="xs" disabled>
        <CheckCircleIcon color="green" width={12} height={12} />
        Approved
      </Button>
    );
  }

  return (
    <Button
      variant="solid"
      size="xs"
      onClick={handleApprove}
      isLoading={isLoading}
      disabled={isLoading}
      loadingText="Approving..."
      loading={isLoading}
      pr={4}
    >
      Approve
    </Button>
  );
};

ActionApproveButton.propTypes = {
  invitationId: PropTypes.number.isRequired,
  vaultId: PropTypes.string.isRequired,
};

const InvitationItem = ({ invitation }) => {
  const { vaultId } = useParams();
  const signers = useSelector((state) => selectVaultSigners(state, vaultId));
  const threshold = useSelector((state) =>
    selectVaultThreshold(state, vaultId)
  );
  const approvals = useSelector((state) =>
    selectApprovalsCount(state, vaultId, invitation.id)
  );
  const approversUserId = useSelector((state) =>
    selectApprovers(state, vaultId, invitation.id)
  );
  const rejectorsUserId = useSelector((state) =>
    selectRejectors(state, vaultId, invitation.id)
  );

  const approvers = useSelector((state) =>
    selectUsersByIdArray(state, approversUserId)
  );

  const rejectors = useSelector((state) =>
    selectUsersByIdArray(state, rejectorsUserId)
  );

  const [derivedSentimentColor, setDerivedSentimentColor] = useState("");

  useEffect(() => {
    if (invitation.executed) {
      setDerivedSentimentColor("kg.good");
    } else {
      setDerivedSentimentColor("kg.neutral");
    }
  }, [invitation.executed]);

  function conditionallyRenderActionButton() {
    if (invitation.executed) {
      return;
    }

    if (approvals >= Math.min(threshold, signers.length)) {
      return <ActionExecuteButton invitation={invitation} />;
    }

    return (
      <ActionApproveButton vaultId={vaultId} invitationId={invitation.id} />
    );
  }

  function conditionallyRenderApprovalGrid() {
    if (invitation.executed) return null;
    return <ApprovalGrid showThreshold={true} proposalId={invitation.id} />;
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <VStack spacing={3} align="stretch">
        <HStack spacing={2}>
          <UserPlusIcon width={16} height={16} style={{ color: "#718096" }} />
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            Signer Invitation
          </Text>
        </HStack>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            {invitation.invitee && (
              <AddressDisplay address={invitation.invitee} type="principal" />
            )}
            <HStack>
              <SentimentTransactionBadge
                content={`Invitation`}
                sentiment="kg.good"
              />
              <SentimentTransactionBadge
                content={invitation.executed ? "Success" : "Pending"}
                sentiment={derivedSentimentColor}
              />
            </HStack>
          </VStack>
          <VStack align="end">
            {conditionallyRenderActionButton()}
            {conditionallyRenderApprovalGrid()}
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};

InvitationItem.propTypes = {
  invitation: PropTypes.object.isRequired,
};

export default InvitationItem;
