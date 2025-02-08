import { HStack, VStack, Text, Center, Separator } from "@chakra-ui/react";
import { InboxIcon } from "@heroicons/react/24/solid";
import { useColorModeValue } from "@/components/ui/color-mode";
import FilterButtonGroup from "@/components/ui/filter-button-group";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTransactions } from "@/state/transactions_slice";
import { selectIsAuthenticated, selectCurrentVault } from "@/state/session_slice";
import {
  PendingFilter,
  ExecutedFilter,
  FailedFilter,
} from "@/constants/filters";
import PropTypes from "prop-types";
import TransactionItem from "@/components/ui/transaction-item";
import { Spinner } from "@chakra-ui/react";

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
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentVault = useSelector(selectCurrentVault);
  const fetchAllLoading = useSelector((state) => state.transactions.fetchAllLoading);
  const [selectedFilters, setSelectedFilters] = useState([PendingFilter]);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const filters = [PendingFilter, ExecutedFilter, FailedFilter];

  useEffect(() => {
    if (isAuthenticated && currentVault) {
      dispatch(fetchAllTransactions());
    }
  }, [dispatch, isAuthenticated, currentVault]);

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

  if (fetchAllLoading) {
    return (
      <Center w="full" py={12}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!transactions.length) {
    return <EmptyTransactions />;
  }

  return (
    <VStack spacing={3} align="stretch">
      <Text fontSize="lg" fontWeight="semibold" mt={6}>
        Transaction History
      </Text>
      <Separator />
      <HStack spacing={2} fontSize="sm" mt={2} mb={2}>
        <Text color="gray.500">Filter by status:</Text>
        <FilterButtonGroup
          filters={filters}
          selectedFilters={selectedFilters}
          onChange={setSelectedFilters}
          singleSelect={true}
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
};

export default TransactionsList;
