import { VStack, Box, HStack, Text } from "@chakra-ui/react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";
import BalanceDisplay from "@/components/ui/balance-display";
import CreateTransaction from "@/components/ui/create-transaction";
import Signers from "@/components/ui/signers";
import Header from "@/components/ui/header";
import CollapsibleButton from "@/components/ui/collapsible-button";
import TransactionsList from "@/components/ui/transactions-list";
import DevModePanel from "@/components/ui/dev-mode-panel";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectIsAuthenticating,
} from "@/state/session_slice";
import { Feature } from "@/components/ui/feature";
import { initialize } from "@/state/session_slice";
import { Toaster } from "@/components/ui/toaster";
import { ConnectWallet } from "@nfid/identitykit/react";
import { useAgent } from "@nfid/identitykit/react";
import { fetchVaults } from "@/state/vaults_slice";

function MultisigWallet() {
  const dispatch = useDispatch();
  const { transactions_list } = useSelector((state) => state.transactions);
  const isAuthenticated = useSelector((state) => selectIsAuthenticated(state));
  const isAuthenticating = useSelector((state) =>
    selectIsAuthenticating(state)
  );
  const authenticatedAgent = useAgent({
    host: import.meta.env.VITE_IC_HOST,
  });

  useEffect(() => {
    if (authenticatedAgent) {
      console.log("Running initialize dispatch");
      dispatch(initialize(authenticatedAgent));
    }
  }, [authenticatedAgent]);

  useEffect(() => {
    dispatch(fetchVaults());
  }, [isAuthenticated]);

  return (
    <Box maxW="1100px" mx="auto" pt={8}>
      <VStack spacing={4} p={4} align="stretch">
        <Feature name="header">
          <Header />
        </Feature>

        <Feature name="vaults">
          <Box mt={4}>
            <BalanceDisplay symbol="ICP" />
          </Box>
        </Feature>

        <Feature name="signers">
          <Signers />
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
              {({ onClose }) => <CreateTransaction onClose={onClose} />}
            </CollapsibleButton>

            <TransactionsList transactions={transactions_list} />
          </VStack>
        </Feature>
      </VStack>
      <DevModePanel />
      <Toaster />
      {!isAuthenticated && !isAuthenticating && <ConnectWallet />}
    </Box>
  );
}

export default MultisigWallet;
