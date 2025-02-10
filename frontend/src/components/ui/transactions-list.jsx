import {
  HStack,
  VStack,
  Text,
  Center,
  Separator,
  Box,
  Code,
} from "@chakra-ui/react";
import { InboxIcon } from "@heroicons/react/24/solid";
import { useColorModeValue } from "@/components/ui/color-mode";
import FilterButtonGroup from "@/components/ui/filter-button-group";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTransactions } from "@/state/transactions_slice";
import {
  selectIsAuthenticated,
  selectCurrentVault,
  selectCurrentVaultId,
} from "@/state/session_slice";
import { PendingFilter, ExecutedFilter } from "@/constants/filters";
import PropTypes from "prop-types";
import TransactionItem from "@/components/ui/transaction-item";
import { Spinner } from "@chakra-ui/react";
import { selectVaultSigners } from "@/state/signers_slice";
import { selectVaultThreshold } from "@/state/vaults_slice";

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

const TransactionsList = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentVault = useSelector(selectCurrentVault);
  const currentVaultId = useSelector(selectCurrentVaultId);
  const fetchAllLoading = useSelector(
    (state) => state.transactions.fetchAllLoading
  );
  const transactions = useSelector(
    (state) => state.transactions.transactions_list
  );
  const signers = useSelector((state) =>
    selectVaultSigners(state, currentVaultId)
  );
  const threshold = useSelector((state) =>
    selectVaultThreshold(state, currentVaultId)
  );
  const [selectedFilters, setSelectedFilters] = useState([PendingFilter]);
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);
  const [debugInfo, setDebugInfo] = useState({});
  const filters = [PendingFilter, ExecutedFilter];

  useEffect(() => {
    if (isAuthenticated && currentVault) {
      dispatch(fetchAllTransactions());
    }
  }, [dispatch, isAuthenticated, currentVault]);

  useEffect(() => {
    function applySelectedFilters(transactions) {
      console.log("Applying selected filters to transactions", transactions);
      const debugData = {
        totalTransactions: transactions.length,
        activeFilters: selectedFilters.map((f) => f.label),
        filterResults: {},
      };

      if (!selectedFilters.length) {
        setDebugInfo({
          ...debugData,
          message: "No filters active - showing all transactions",
        });
        return transactions;
      }

      const filtered = transactions.filter((tx) => {
        const matchingFilters = selectedFilters.filter((filter) => {
          const matches = filter.fn(tx);
          if (!debugData.filterResults[filter.label]) {
            debugData.filterResults[filter.label] = {
              matched: 0,
              total: transactions.length,
            };
          }
          if (matches) {
            debugData.filterResults[filter.label].matched++;
          }
          return matches;
        });
        return matchingFilters.length > 0;
      });

      debugData.filteredCount = filtered.length;
      setDebugInfo(debugData);
      return filtered;
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

  if (!transactions?.length) {
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
  signers: PropTypes.array,
  threshold: PropTypes.number,
};

export default TransactionsList;
