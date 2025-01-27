import { HStack, VStack, Text, Button, Box } from "@chakra-ui/react";
import { CheckCircleIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import AddressDisplay from "@/components/ui/address-display";
import ApprovalGrid from "@/components/ui/approval-grid";
import PropTypes from "prop-types";
import {
  SentimentTransactionBadge,
  TransactionBadge,
} from "@/components/ui/transaction-badge";
import floatPrecision from "@/utils/floatPrecision";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  recordDecision,
  hasUserApprovedThisTxId,
  selectApprovalsCount,
} from "@/state/decisions_slice";
import { selectVaultThreshold } from "@/state/vaults_slice";
import { selectCurrentVaultId, selectCurrentUser } from "@/state/session_slice";
import { selectVaultSigners } from "@/state/signers_slice";

const ActionExecuteButton = ({ tx }) => {
  const currentVaultId = useSelector((state) => selectCurrentVaultId(state));

  const approvals = useSelector((state) =>
    selectApprovalsCount(state, currentVaultId, tx.id)
  );

  const threshold = useSelector((state) =>
    selectVaultThreshold(state, currentVaultId)
  );

  const signers = useSelector((state) =>
    selectVaultSigners(state, currentVaultId)
  );

  const adjustedThreshold = Math.min(threshold, signers.length);

  return (
    <Button
      variant={approvals >= adjustedThreshold ? "solid" : "outline"}
      colorScheme={approvals >= adjustedThreshold ? "green" : "blue"}
      disabled={approvals < adjustedThreshold}
      size="xs"
    >
      Execute
    </Button>
  );
};

ActionExecuteButton.propTypes = {
  tx: PropTypes.object.isRequired,
};

const ActionApproveButton = ({ txId, vaultId }) => {
  const dispatch = useDispatch();
  const { decisionsLoading } = useSelector((state) => state.decisions);
  const currentUser = useSelector((state) => selectCurrentUser(state));
  const hasApproved = useSelector((state) =>
    hasUserApprovedThisTxId(state, vaultId, txId, currentUser?.id)
  );

  const handleApprove = () => {
    dispatch(
      recordDecision({
        vaultId,
        transactionId: txId,
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
      isLoading={decisionsLoading}
      disabled={decisionsLoading}
      loadingText="Approving..."
      loading={decisionsLoading}
      pr={4}
    >
      Approve
    </Button>
  );
};

const TransactionItem = ({ tx }) => {
  const [derivedSentimentColor, setDerivedSentimentColor] = useState("");
  const currentVaultId = useSelector((state) => selectCurrentVaultId(state));
  const signers = useSelector((state) =>
    selectVaultSigners(state, currentVaultId)
  );
  const threshold = useSelector((state) =>
    selectVaultThreshold(state, currentVaultId)
  );
  const approvals = useSelector((state) =>
    selectApprovalsCount(state, currentVaultId, tx.id)
  );

  const adjustedThreshold = Math.min(threshold, signers.length);

  useEffect(() => {
    if (tx.isSuccessful) {
      setDerivedSentimentColor("kg.good");
    } else if (tx.isExecuted && !tx.isSuccessful) {
      setDerivedSentimentColor("kg.bad");
    } else {
      setDerivedSentimentColor("kg.neutral");
    }
  }, [tx.isSuccessful]);

  function deriveStatusDisplayText() {
    if (tx.isExecuted && tx.isSuccessful) {
      return "Executed";
    }

    if (tx.isExecuted && !tx.isSuccessful) {
      return "Failed";
    }

    return "Pending";
  }

  function conditionallyRenderActionButton() {
    if (tx.isExecuted) {
      return (
        <VStack align="flex-end" spacing={2}>
          <HStack>
            <Text fontSize="xs" cursor="pointer">
              See transaction details
            </Text>
            <ChevronRightIcon width={12} height={12} />
          </HStack>
        </VStack>
      );
    }

    if (tx.isSuccessful) {
      return <CheckCircleIcon color="white" width={20} height={20} />;
    }

    if (approvals >= adjustedThreshold) {
      return <ActionExecuteButton tx={tx} />;
    }

    return <ActionApproveButton vaultId={currentVaultId} txId={tx.id} />;
  }

  function conditionallyRenderApprovalGrid() {
    if (tx.isExecuted) {
      return null;
    }

    return <ApprovalGrid showThreshold={true} txId={tx.id} />;
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <AddressDisplay
            address={tx.recipient}
            type={tx.recipient.startsWith("rrkah") ? "principal" : "account"}
          />
          <HStack>
            <TransactionBadge content={`${floatPrecision(tx.amount)} ICP`} />
            <SentimentTransactionBadge
              content={deriveStatusDisplayText()}
              sentiment={derivedSentimentColor}
            />
          </HStack>
        </VStack>

        <VStack align="flex-end">
          {conditionallyRenderActionButton()}
          {conditionallyRenderApprovalGrid()}
        </VStack>
      </HStack>
    </Box>
  );
};

TransactionItem.propTypes = {
  tx: PropTypes.object.isRequired,
};

export default TransactionItem;
