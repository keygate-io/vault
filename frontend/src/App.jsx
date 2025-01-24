import { VStack, Box } from "@chakra-ui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import BalanceDisplay from "@/components/ui/balance-display";
import CreateTransaction from "@/components/ui/create-transaction";
import Signers from "@/components/ui/signers";
import Header from "@/components/ui/header";
import CollapsibleButton from "@/components/ui/collapsible-button";
import TransactionsList from "@/components/ui/transactions-list";
import {
  generateMockTransactions,
  generateMockSigners,
} from "@/utils/mockDataGenerator";

function MultisigWallet() {
  const mockTransactions = generateMockTransactions(2);
  const mockSigners = generateMockSigners(3);

  return (
    <Box maxW="1100px" mx="auto" pt={8}>
      <VStack spacing={4} p={4} align="stretch">
        <Header />

        <Box mt={4}>
          <BalanceDisplay balance="125.45" symbol="ICP" />
        </Box>

        <Signers />

        <VStack spacing={3} align="stretch" mt={8}>
          <CollapsibleButton buttonText="New transaction" icon={<PlusIcon />}>
            {({ onClose }) => (
              <CreateTransaction onClose={onClose} mockSigners={mockSigners} />
            )}
          </CollapsibleButton>

          <TransactionsList
            transactions={mockTransactions}
            signers={mockSigners}
          />
        </VStack>
      </VStack>
    </Box>
  );
}

export default MultisigWallet;
