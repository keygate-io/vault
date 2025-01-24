import { VStack, Box, HStack, Text, Button, ButtonGroup } from "@chakra-ui/react";
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
  const mockSigners = generateMockSigners(5);

  return (
    <Box maxW="1100px" mx="auto" pt={8}>
      <VStack spacing={4} p={4} align="stretch">
        <Header />

        <Box mt={4}>
          <BalanceDisplay balance="125.45" symbol="ICP" />
        </Box>

        <Signers signers={mockSigners} />

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
              <CreateTransaction onClose={onClose} mockSigners={mockSigners} />
            )}
          </CollapsibleButton>

          <HStack spacing={2} fontSize="sm" mt={6}>
            <Text color="gray.500">Filter:</Text>
            <Box 
              display="inline-flex" 
              bg="gray.100" 
              _dark={{ bg: "gray.800" }}
              borderRadius="full" 
              p="1"
            >
              <Button
                size="xs"
                borderRadius="full"
                bg="white"
                color="gray.900"
                _dark={{ bg: "gray.700", color: "white" }}
                boxShadow="sm"
                _hover={{ bg: "white", _dark: { bg: "gray.700" }}}
              >
                Under review
              </Button>
              <Button
                size="xs"
                variant="ghost"
                borderRadius="full"
                color="gray.600"
                _dark={{ color: "gray.400" }}
                _hover={{ bg: "blackAlpha.50", _dark: { bg: "whiteAlpha.50" }}}
              >
                Approved
              </Button>
              <Button
                size="xs"
                variant="ghost"
                borderRadius="full"
                color="gray.600"
                _dark={{ color: "gray.400" }}
                _hover={{ bg: "blackAlpha.50", _dark: { bg: "whiteAlpha.50" }}}
              >
                Rejected
              </Button>
            </Box>
          </HStack>

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
