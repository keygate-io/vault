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
  approveTransaction,
  hasUserApprovedThisTxId,
  selectApprovalsCount,
} from "@/state/approvals_slice";
import { selectVaultThreshold } from "@/state/vaults_slice";

const ActionExecuteButton = ({ tx }) => {
  const approvals = useSelector((state) => selectApprovalsCount(state, tx.id));

  const threshold = useSelector((state) =>
    selectVaultThreshold(state, tx.vaultId)
  );

  return (
    <Button
      variant={approvals >= threshold ? "solid" : "outline"}
      colorScheme={approvals >= threshold ? "green" : "blue"}
      disabled={approvals >= threshold}
      size="xs"
    >
      Execute
    </Button>
  );
};

ActionExecuteButton.propTypes = {
  tx: PropTypes.object.isRequired,
};

const ActionApproveButton = ({ txId }) => {
  const dispatch = useDispatch();
  const { approveLoading } = useSelector((state) => state.approvals);
  const currentUser = useSelector((state) => state.session.currentUser);
  const _hasUserApprovedThisTxId = useSelector((state) =>
    hasUserApprovedThisTxId(state, txId, currentUser?.id)
  );

  const handleApprove = () => {
    dispatch(approveTransaction(txId));
  };

  return (
    <Button
      variant={_hasUserApprovedThisTxId ? "ghost" : "solid"}
      size="xs"
      onClick={handleApprove}
      isLoading={approveLoading}
      disabled={_hasUserApprovedThisTxId}
    >
      {_hasUserApprovedThisTxId && (
        <CheckCircleIcon color="green" width={12} height={12} />
      )}
      {_hasUserApprovedThisTxId ? "Approved." : "Approve"}
    </Button>
  );
};

const TransactionItem = ({ tx }) => {
  const [derivedSentimentColor, setDerivedSentimentColor] = useState("");
  const threshold = useSelector((state) =>
    selectVaultThreshold(state, tx.vaultId)
  );

  const approvals = useSelector((state) => selectApprovalsCount(state, tx.id));

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

    if (approvals >= threshold) {
      return <ActionExecuteButton tx={tx} threshold={threshold} />;
    }

    return <ActionApproveButton txId={tx.id} />;
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
