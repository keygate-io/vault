import { HStack, VStack, Text, Button, Box } from "@chakra-ui/react";
import { CheckCircleIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import AddressDisplay from "@/components/ui/address-display";
import ApprovalGrid from "@/components/ui/approval-grid";
import { useColorModeValue } from "@/components/ui/color-mode";
import PropTypes from "prop-types";
import {
  SentimentTransactionBadge,
  TransactionBadge,
} from "@/components/ui/transaction-badge";
import floatPrecision from "@/utils/floatPrecision";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { approveTransaction } from "@/state/transactions_actions";
import { makeSelectApprovalsByTxId } from "@/state/transactions_derived";
const ActionExecuteButton = ({ tx, threshold }) => {
  const selectApprovalsByTxId = makeSelectApprovalsByTxId();
  const approvals = useSelector((state) => selectApprovalsByTxId(state, tx.id));

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
  threshold: PropTypes.number.isRequired,
};

const ActionApproveButton = ({ txId }) => {
  const dispatch = useDispatch();
  const { approveLoading } = useSelector((state) => state);

  const handleApprove = () => {
    console.log("approving transaction", txId);
    dispatch(approveTransaction(txId));
  };

  return (
    <Button
      variant="outline"
      colorScheme="blue"
      size="xs"
      onClick={handleApprove}
      isLoading={approveLoading}
    >
      Approve {approveLoading}
    </Button>
  );
};

const TransactionItem = ({ tx, signers, threshold }) => {
  const [derivedSentimentColor, setDerivedSentimentColor] = useState("");
  const selectApprovalsByTxId = makeSelectApprovalsByTxId();
  const approvals = useSelector((state) => selectApprovalsByTxId(state, tx.id));

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

  /* eslint-disable-next-line */
  const bgColor = useColorModeValue("gray.50", "whiteAlpha.100");

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

    return (
      <ApprovalGrid
        signers={signers}
        approvals={approvals}
        threshold={threshold}
        showThreshold={true}
        txId={tx.id}
      />
    );
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
  signers: PropTypes.array.isRequired,
  threshold: PropTypes.number.isRequired,
};

export default TransactionItem;
