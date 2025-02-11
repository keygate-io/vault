import { HStack, VStack, Button, Box, Text } from "@chakra-ui/react";
import {
  CheckCircleIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import AddressDisplay from "@/components/ui/address-display";
import ApprovalGrid from "@/components/ui/approval-grid";
import { SentimentTransactionBadge } from "@/components/ui/transaction-badge";
import PropTypes from "prop-types";
import { floatPrecision } from "@/utils/floatPrecision";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  recordDecision,
  hasUserApprovedThisProposal,
  selectApprovalsCount,
  isTransactionLoading,
} from "@/state/decisions_slice";
import { selectVaultThreshold, fetchVaultBalance } from "@/state/vaults_slice";
import { selectCurrentVaultId, selectCurrentUser } from "@/state/session_slice";
import { selectVaultSigners } from "@/state/signers_slice";
import { selectUsersByIdArray } from "@/state/users_slice";
import {
  executeTransaction,
  isExecutionLoading,
} from "@/state/transactions_slice";
import { selectApprovers, selectRejectors } from "@/state/decisions_slice";
import { Avatar } from "@/components/ui/avatar/avatar";
import { AvatarGroup } from "@/components/ui/avatar/avatar-group";

const ActionExecuteButton = ({ tx }) => {
  const dispatch = useDispatch();
  const { vaultId } = useParams();

  const approvals = useSelector((state) =>
    selectApprovalsCount(state, vaultId, tx.id)
  );

  const threshold = useSelector((state) =>
    selectVaultThreshold(state, vaultId)
  );

  const signers = useSelector((state) => selectVaultSigners(state, vaultId));

  const adjustedThreshold = Math.min(threshold, signers.length);

  const isExecuting = useSelector((state) => isExecutionLoading(state, tx.id));

  const handleExecute = async () => {
    await dispatch(
      executeTransaction({ vaultId: vaultId, transactionId: tx.id })
    );
    dispatch(fetchVaultBalance(vaultId));
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
  tx: PropTypes.object.isRequired,
};

const ActionApproveButton = ({ vaultId, proposalId }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) =>
    isTransactionLoading(state, proposalId)
  );
  const currentUser = useSelector((state) => selectCurrentUser(state));
  const hasApproved = useSelector((state) =>
    hasUserApprovedThisProposal(state, vaultId, proposalId, currentUser?.id)
  );

  const handleApprove = () => {
    dispatch(
      recordDecision({
        vaultId,
        transactionId: proposalId,
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
  vaultId: PropTypes.string.isRequired,
  proposalId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

const TransactionItem = ({ tx }) => {
  const { vaultId } = useParams();
  const signers = useSelector((state) => selectVaultSigners(state, vaultId));
  const threshold = useSelector((state) =>
    selectVaultThreshold(state, vaultId)
  );
  const approvals = useSelector((state) =>
    selectApprovalsCount(state, vaultId, tx.id)
  );
  const approversUserId = useSelector((state) =>
    selectApprovers(state, vaultId, tx.id)
  );
  const rejectorsUserId = useSelector((state) =>
    selectRejectors(state, vaultId, tx.id)
  );

  const approvers = useSelector((state) =>
    selectUsersByIdArray(state, approversUserId)
  );

  const rejectors = useSelector((state) =>
    selectUsersByIdArray(state, rejectorsUserId)
  );

  const [derivedSentimentColor, setDerivedSentimentColor] = useState("");

  useEffect(() => {
    if (tx.executed) {
      setDerivedSentimentColor("kg.good");
    } else {
      setDerivedSentimentColor("kg.neutral");
    }
  }, [tx.executed]);

  function conditionallyRenderActionButton() {
    if (tx.executed) {
      return;
    }

    if (approvals >= Math.min(threshold, signers.length)) {
      return <ActionExecuteButton tx={tx} />;
    }

    return <ActionApproveButton vaultId={vaultId} proposalId={tx.id} />;
  }

  function conditionallyRenderApprovalGrid() {
    if (tx.executed) return null;
    return <ApprovalGrid showThreshold={true} proposalId={tx.id} />;
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <VStack spacing={3} align="stretch">
        <HStack spacing={2}>
          <ArrowRightIcon width={16} height={16} style={{ color: "#718096" }} />
          <Text fontSize="sm" color="gray.500" fontWeight="medium">
            Transfer
          </Text>
        </HStack>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            {tx.recipient && (
              <AddressDisplay address={tx.recipient} type="principal" />
            )}
            <HStack>
              <SentimentTransactionBadge
                content={`${floatPrecision(tx.amount)} ICP`}
                sentiment="kg.neutral"
              />
              <SentimentTransactionBadge
                content={tx.executed ? "Success" : "Pending"}
                sentiment={derivedSentimentColor}
              />
              {tx.executed && (
                <AvatarGroup>
                  {approvers.map((approver, index) => (
                    <Box position="relative" key={approver.id}>
                      <Avatar
                        name={approver.name}
                        src={approver.avatarUrl}
                        fallback={approver.name[0]}
                        ml={index === 0 ? 0 : -7}
                        size="xs"
                      />
                      <Box
                        position="absolute"
                        bottom="-1"
                        right="-1"
                        zIndex={100}
                      >
                        <CheckBadgeIcon
                          width={12}
                          height={12}
                          color="#22c55e"
                        />
                      </Box>
                    </Box>
                  ))}
                </AvatarGroup>
              )}
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

TransactionItem.propTypes = {
  tx: PropTypes.object.isRequired,
};

export default TransactionItem;
