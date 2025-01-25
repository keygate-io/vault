import { HStack, VStack, Text, Center } from "@chakra-ui/react";
import { InboxIcon } from "@heroicons/react/24/solid";
import { useColorModeValue } from "@/components/ui/color-mode";
import FilterButtonGroup from "@/components/ui/filter-button-group";
import { useState, useEffect } from "react";
import {
  PendingFilter,
  ExecutedFilter,
  FailedFilter,
} from "@/constants/filters";
import PropTypes from "prop-types";
import TransactionItem from "@/components/ui/transaction-item";

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

const TransactionsList = ({ transactions, signers, threshold }) => {
  const [selectedFilters, setSelectedFilters] = useState([PendingFilter]);
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);
  const filters = [PendingFilter, ExecutedFilter, FailedFilter];

  useEffect(() => {
    function applySelectedFilters(transactions) {
      if (!selectedFilters.length) {
        return transactions;
      }

      return transactions.filter((tx) =>
        selectedFilters.some((filter) => filter.fn(tx))
      );
    }

    setFilteredTransactions(applySelectedFilters(transactions));
  }, [selectedFilters, transactions]);

  if (!transactions.length) {
    return <EmptyTransactions />;
  }

  return (
    <VStack spacing={3} align="stretch">
      <Text fontSize="lg" fontWeight="semibold" mt={6}>
        Transaction History
      </Text>
      <HStack spacing={2} fontSize="sm">
        <Text color="gray.500">Filter by status:</Text>
        <FilterButtonGroup
          filters={filters}
          selectedFilters={selectedFilters}
          onChange={setSelectedFilters}
        />
      </HStack>
      {filteredTransactions.map((tx) => (
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
