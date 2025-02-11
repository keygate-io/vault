import {
  HStack,
  VStack,
  Text,
  Center,
  Separator,
  Box,
  IconButton,
} from "@chakra-ui/react";
import {
  InboxIcon,
  ArrowRightIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
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
import {
  selectInvitations,
  fetchAllInvitations,
} from "@/state/invitations_slice";
import InvitationItem from "@/components/ui/invitation-item";

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

const EmptyFilteredTransactions = ({ filter }) => {
  const textColor = useColorModeValue("gray.600", "gray.400");
  return (
    <Center w="full" py={12}>
      <VStack spacing={3}>
        <InboxIcon className="text-gray-400" width={32} />
        <Text fontSize="md" color={textColor}>
          No {filter.value} proposals
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
  const invitations = useSelector((state) => selectInvitations(state));
  const signers = useSelector((state) =>
    selectVaultSigners(state, currentVaultId)
  );
  const threshold = useSelector((state) =>
    selectVaultThreshold(state, currentVaultId)
  );
  const [selectedFilters, setSelectedFilters] = useState([PendingFilter]);
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);
  const [filteredInvitations, setFilteredInvitations] = useState(invitations);
  const filters = [PendingFilter, ExecutedFilter];
  const [showTransfers, setShowTransfers] = useState(true);
  const [showInvitations, setShowInvitations] = useState(true);

  useEffect(() => {
    if (isAuthenticated && currentVault) {
      dispatch(fetchAllTransactions());
      dispatch(fetchAllInvitations());
    }
  }, [dispatch, isAuthenticated, currentVault]);

  useEffect(() => {
    function applySelectedFilters(items) {
      if (!selectedFilters.length || !items) {
        return items || [];
      }

      console.log("Filtering items:", items);

      return items.filter((item) => {
        // Common filter logic for both transactions and invitations
        const isPending = !item.executed;
        const isExecuted = item.executed;

        return selectedFilters.some((filter) => {
          switch (filter) {
            case PendingFilter:
              return isPending;
            case ExecutedFilter:
              return isExecuted;
            default:
              return false;
          }
        });
      });
    }

    setFilteredTransactions(applySelectedFilters(transactions));
    setFilteredInvitations(applySelectedFilters(invitations));
  }, [selectedFilters, transactions, invitations]);

  if (fetchAllLoading) {
    return (
      <Center w="full" py={12}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      <Text fontSize="lg" fontWeight="semibold" mt={6}>
        Proposals
      </Text>
      <Separator />
      <HStack spacing={4} fontSize="sm" mt={2} mb={2} justify="space-between">
        <HStack spacing={2}>
          <Text color="gray.500">Filter by status:</Text>
          <FilterButtonGroup
            filters={filters}
            selectedFilters={selectedFilters}
            onChange={setSelectedFilters}
            singleSelect={true}
          />
        </HStack>

        <HStack spacing={2}>
          <Box position="relative">
            <IconButton
              variant={"ghost"}
              onClick={() => setShowTransfers(!showTransfers)}
              bg={showTransfers ? "gray.400" : "transparent"}
              _hover={{ bg: showTransfers ? "gray.600" : "gray.100" }}
              _dark={{
                bg: showTransfers ? "gray.800" : "transparent",
                _hover: { bg: showTransfers ? "gray.600" : "gray.700" },
              }}
            >
              <ArrowRightIcon width={16} height={16} color="gray.500" />
            </IconButton>
          </Box>
          <Box position="relative">
            <IconButton
              variant={"ghost"}
              onClick={() => setShowInvitations(!showInvitations)}
              bg={showInvitations ? "gray.100" : "transparent"}
              _hover={{ bg: showInvitations ? "gray.600" : "gray.100" }}
              _dark={{
                bg: showInvitations ? "gray.800" : "transparent",
                _hover: { bg: showInvitations ? "gray.600" : "gray.700" },
              }}
            >
              <UserPlusIcon width={16} height={16} color="gray.500" />
            </IconButton>
          </Box>
        </HStack>
      </HStack>

      {!filteredTransactions?.length && !filteredInvitations?.length ? (
        <EmptyFilteredTransactions filter={selectedFilters[0]} />
      ) : (
        <>
          {showTransfers &&
            filteredTransactions?.length > 0 &&
            filteredTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                signers={signers}
                threshold={threshold}
              />
            ))}

          {showInvitations &&
            Array.isArray(filteredInvitations) &&
            filteredInvitations.length > 0 &&
            filteredInvitations.map((invitation) => (
              <InvitationItem key={invitation.id} invitation={invitation} />
            ))}
        </>
      )}
    </VStack>
  );
};

TransactionsList.propTypes = {
  signers: PropTypes.array,
  threshold: PropTypes.number,
};

export default TransactionsList;

