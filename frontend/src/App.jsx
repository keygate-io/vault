import { VStack, Box, HStack, Text } from "@chakra-ui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import BalanceDisplay from "@/components/ui/balance-display";
import CreateTransaction from "@/components/ui/create-transaction";
import Signers from "@/components/ui/signers";
import Header from "@/components/ui/header";
import CollapsibleButton from "@/components/ui/collapsible-button";
import TransactionsList from "@/components/ui/transactions-list";
import DevModePanel from "@/components/ui/dev-mode-panel";
import { generateMockThreshold } from "@/utils/mockDataGenerator";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "@/state/transactions_actions";
import { fetchSigners } from "@/state/signers_actions";
import { fetchVault } from "@/state/vault_actions";
import { Feature } from "@/components/ui/feature";

function MultisigWallet() {
  const dispatch = useDispatch();
  const { transactions_list } = useSelector((state) => state.transactions);
  const { signers } = useSelector((state) => state.signers);
  const { vault_details } = useSelector((state) => state.vault);

  useEffect(() => {
    dispatch(fetchVault());
    dispatch(fetchTransactions());
    dispatch(fetchSigners());
  }, [dispatch]);

  const [threshold, setThreshold] = useState(1);

  useEffect(() => {
    if (signers.length > 0) {
      setThreshold(generateMockThreshold(1, signers.length));
    }
  }, [signers]);

  return (
    <Box maxW="1100px" mx="auto" pt={8}>
      <VStack spacing={4} p={4} align="stretch">
        <Feature name="header">
          <Header />
        </Feature>

        <Feature name="vault">
          <Box mt={4}>
            <BalanceDisplay balance={vault_details.balance} symbol="ICP" />
          </Box>
        </Feature>

        <Feature name="signers">
          <Signers signers={signers} />
        </Feature>

        <Feature name="transactions">
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
              transactions={transactions_list}
              signers={signers}
              threshold={threshold}
            />
          </VStack>
        </Feature>
      </VStack>
      <DevModePanel />
    </Box>
  );
}

export default MultisigWallet;
