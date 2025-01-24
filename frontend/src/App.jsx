import { VStack, Box, HStack, Text, Button } from "@chakra-ui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import BalanceDisplay from "@/components/ui/balance-display";
import CreateTransaction from "@/components/ui/create-transaction";
import Signers from "@/components/ui/signers";
import Header from "@/components/ui/header";
import CollapsibleButton from "@/components/ui/collapsible-button";
import TransactionsList from "@/components/ui/transactions-list";
import FilterButtonGroup from "@/components/ui/filter-button-group";
import {
  generateMockTransactions,
  generateMockSigners,
} from "@/utils/mockDataGenerator";
import { InMemorySignerRepository } from "@/repository/signers";
import { InMemoryTransactionRepository } from "@/repository/transactions";

function MultisigWallet() {
  const [transactions, setTransactions] = useState([]);
  const [signers, setSigners] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(["under_review"]);

  useEffect(() => {
    async function fetchSigners() {
      const initialSigners = generateMockSigners(1, 5);
      const signersRepo = new InMemorySignerRepository(initialSigners);
      const signersArray = await signersRepo.getAll();
      setSigners(signersArray);
    }

    async function fetchTransactions() {
      const initialTransactions = generateMockTransactions(0, 5);
      const transactionsRepo = new InMemoryTransactionRepository(
        initialTransactions
      );
      const transactionsArray = await transactionsRepo.getAll();
      setTransactions(transactionsArray);
    }

    fetchTransactions();
    fetchSigners();
  }, []);

  const filters = [
    { value: "under_review", label: "Under review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <Box maxW="1100px" mx="auto" pt={8}>
      <VStack spacing={4} p={4} align="stretch">
        <Header />

        <Box mt={4}>
          <BalanceDisplay balance="125.45" symbol="ICP" />
        </Box>

        <Signers signers={signers} />

        <VStack spacing={3} align="stretch" mt={8}>
          <CollapsibleButton
            content={
              <HStack spacing={2} align="center">
                <PlusIcon className="w-4 h-4" />
                <Text>New proposal</Text>
              </HStack>
            }
            size="sm"
            colorScheme="gray"
          >
            {({ onClose }) => (
              <CreateTransaction onClose={onClose} signers={signers} />
            )}
          </CollapsibleButton>

          <HStack spacing={2} fontSize="sm" mt={6}>
            <Text color="gray.500">Filter by status:</Text>
            <FilterButtonGroup
              filters={filters}
              selectedFilters={selectedFilters}
              onChange={setSelectedFilters}
            />
          </HStack>

          <TransactionsList
            transactions={transactions}
            signers={signers}
            threshold={3}
            filters={selectedFilters}
          />
        </VStack>
      </VStack>
    </Box>
  );
}

export default MultisigWallet;
