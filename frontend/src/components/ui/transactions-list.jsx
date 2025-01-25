import { HStack, VStack, Text, Button, Box, Center } from "@chakra-ui/react";
import { CheckCircleIcon, InboxIcon } from "@heroicons/react/24/solid";
import AddressDisplay from "@/components/ui/address-display";
import ApprovalGrid from "@/components/ui/approval-grid";
import floatPrecision from "@/utils/floatPrecision";
import { useColorModeValue } from "@/components/ui/color-mode";
import FilterButtonGroup from "@/components/ui/filter-button-group";
import { useState } from "react";
import {
  PendingFilter,
  ExecutedFilter,
  FailedFilter,
} from "@/constants/filters";
import PropTypes from "prop-types";

const EmptyTransactions = () => {
  const textColor = useColorModeValue("gray.600", "gray.400");
  return (
    <Center w="full" py={12}>
      <VStack spacing={3}>
        <InboxIcon className="text-gray-400" width={32} />
        <Text fontSize="md" color={textColor}>
          No proposals emitted yet
        </Text>
      </VStack>
    </Center>
  );
};

const ActionExecuteButton = ({ tx, threshold }) => {
  return (
    <Button
      variant={tx.approvals >= threshold ? "solid" : "outline"}
      colorScheme={tx.approvals >= threshold ? "green" : "blue"}
      disabled={tx.approvals >= threshold}
      size="sm"
    >
      Execute
    </Button>
  );
};

ActionExecuteButton.propTypes = {
  tx: PropTypes.object.isRequired,
  threshold: PropTypes.number.isRequired,
};

const ActionApproveButton = () => {
  return (
    <Button variant="outline" colorScheme="blue" size="sm">
      Approve
    </Button>
  );
};

const TransactionItem = ({ tx, signers, threshold }) => {
  const bgColor = useColorModeValue("gray.50", "whiteAlpha.100");

  function conditionallyRenderActionButton() {
    if (tx.isExecuted) {
      return <CheckCircleIcon />;
    }

    if (tx.approvals >= threshold) {
      return <ActionExecuteButton tx={tx} threshold={threshold} />;
    }

    return <ActionApproveButton />;
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <AddressDisplay
            address={tx.recipient}
            type={tx.recipient.startsWith("rrkah") ? "principal" : "account"}
          />
          <HStack justify="space-between">
            <Box bg={bgColor} px={2} py={1} borderRadius="md">
              <Text fontSize="sm" fontWeight="medium">
                {floatPrecision(tx.amount)} ICP
              </Text>
            </Box>
          </HStack>
        </VStack>

        <VStack align="flex-end">
          {conditionallyRenderActionButton()}
          <ApprovalGrid
            mt={1}
            signers={signers}
            approvals={tx.approvals}
            threshold={threshold}
          />
          <ApprovalGrid
            mt={1}
            signers={signers}
            approvals={tx.approvals}
            threshold={2}
          />
          <ApprovalGrid
            mt={1}
            signers={signers}
            approvals={tx.approvals}
            threshold={3}
          />
          <ApprovalGrid
            mt={1}
            signers={signers}
            approvals={tx.approvals}
            threshold={4}
          />
          <ApprovalGrid
            mt={1}
            signers={signers}
            approvals={tx.approvals}
            threshold={5}
          />
          {/* (testing) 4 signers varying threshold */}
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 4)}
            approvals={tx.approvals}
            threshold={4}
          />
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 4)}
            approvals={tx.approvals}
            threshold={3}
          />
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 4)}
            approvals={tx.approvals}
            threshold={2}
          />
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 4)}
            approvals={tx.approvals}
            threshold={1}
          />
          {/* (testing) 3 signers varying threshold */}
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 3)}
            approvals={tx.approvals}
            threshold={3}
          />
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 3)}
            approvals={tx.approvals}
            threshold={3}
          />
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 3)}
            approvals={tx.approvals}
            threshold={2}
          />
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 3)}
            approvals={tx.approvals}
            threshold={1}
          />
          {/* (testing) 2 signers varying threshold */}
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 2)}
            approvals={tx.approvals}
            threshold={2}
          />
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 2)}
            approvals={tx.approvals}
            threshold={1}
          />
          {/* (testing) 1 signer varying threshold */}
          <ApprovalGrid
            mt={1}
            signers={signers.slice(0, 1)}
            approvals={tx.approvals}
            threshold={1}
          />
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

const TransactionsList = ({ transactions, signers, threshold }) => {
  const [selectedFilters, setSelectedFilters] = useState([PendingFilter]);

  const filters = [PendingFilter, ExecutedFilter, FailedFilter];

  function applySelectedFilters(transactions) {
    let filteredTransactions = transactions;
    for (const filter of selectedFilters) {
      filteredTransactions = filteredTransactions.filter(filter.fn);
    }

    return filteredTransactions;
  }

  if (!transactions.length) {
    return <EmptyTransactions />;
  }

  return (
    <VStack spacing={3} align="stretch">
      <HStack spacing={2} fontSize="sm" mt={6}>
        <Text color="gray.500">Filter by status:</Text>
        <FilterButtonGroup
          filters={filters}
          selectedFilters={selectedFilters}
          onChange={setSelectedFilters}
        />
      </HStack>
      {applySelectedFilters(transactions).map((tx) => (
        <TransactionItem
          key={tx.id}
          tx={tx}
          signers={signers}
          threshold={threshold}
        />
      ))}
    </VStack>
  );
};

TransactionsList.propTypes = {
  transactions: PropTypes.array.isRequired,
  signers: PropTypes.array.isRequired,
  threshold: PropTypes.number.isRequired,
};

export default TransactionsList;
