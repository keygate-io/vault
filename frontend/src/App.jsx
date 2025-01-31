import { VStack, Box, HStack, Text, Button} from "@chakra-ui/react";
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
import { fetchTransactions } from "@/state/transactions_slice";
import { getAllUsers, getCurrentUser } from "@/state/users_slice";
import {
  selectCurrentVaultId,
  selectIsAuthenticated,
  selectIsAuthenticating,
} from "@/state/session_slice";
import { Feature } from "@/components/ui/feature";
import { fetchVaultById } from "@/state/vaults_slice";
import { fetchSignersForVault } from "@/state/signers_slice";
import { setAuthenticatedAgent } from "@/state/session_slice";
import { fetchVaults } from "@/state/vaults_slice";
import { selectCurrentUser } from "@/state/session_slice";
import { fetchDecisions } from "@/state/decisions_slice";
import { Toaster } from "@/components/ui/toaster";
import { ConnectWallet } from "@nfid/identitykit/react";
import { useAgent } from "@nfid/identitykit/react";

function MultisigWallet() {
  const dispatch = useDispatch();
  const { transactions_list } = useSelector((state) => state.transactions);
  const currentVaultId = useSelector((state) => selectCurrentVaultId(state));
  const currentUser = useSelector((state) => selectCurrentUser(state));
  const isAuthenticated = useSelector((state) => selectIsAuthenticated(state));
  const authenticatedAgent = useAgent();

  useEffect(() => {
    if (authenticatedAgent) {
      console.log("Found state change for useAgent()'s authenticatedAgent. Dispatching setAuthenticatedAgent.");
      dispatch(setAuthenticatedAgent(authenticatedAgent));
    }
  }, [authenticatedAgent]);

  useEffect(() => {
    dispatch(fetchVaults());
    dispatch(getAllUsers());
    dispatch(getCurrentUser());
  }, [dispatch]);

  // CORE: Once we have the session, we can fetch the vault and the signers
  useEffect(() => {
    if (currentVaultId) {
      dispatch(fetchVaultById(currentVaultId));
      dispatch(fetchTransactions(currentVaultId));
      dispatch(fetchSignersForVault(currentVaultId));
    }
  }, [currentVaultId, dispatch]);

  useEffect(() => {
    dispatch(fetchDecisions());
  }, [currentUser]);

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
      {
        !isAuthenticated && <ConnectWallet />
      }
    </Box>
  );
}

export default MultisigWallet;
