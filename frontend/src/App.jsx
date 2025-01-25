import { VStack, Box, HStack, Text } from "@chakra-ui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import BalanceDisplay from "@/components/ui/balance-display";
import CreateTransaction from "@/components/ui/create-transaction";
import Signers from "@/components/ui/signers";
import Header from "@/components/ui/header";
import CollapsibleButton from "@/components/ui/collapsible-button";
import TransactionsList from "@/components/ui/transactions-list";
import {
  generateMockTransactions,
  generateMockSigners,
  generateMockThreshold,
} from "@/utils/mockDataGenerator";
import { InMemorySignerRepository } from "@/repository/signers";
import { InMemoryTransactionRepository } from "@/repository/transactions";

function MultisigWallet() {
  const [transactions, setTransactions] = useState([]);
  const [signers, setSigners] = useState([]);
  const [threshold, setThreshold] = useState(1);

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

  useEffect(() => {
    if (signers.length > 0) {
      setThreshold(generateMockThreshold(1, signers.length));
    }
  }, [signers]);

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

          <TransactionsList
            transactions={transactions}
            signers={signers}
            threshold={threshold}
          />
        </VStack>
      </VStack>
    </Box>
  );
}

export default MultisigWallet;
