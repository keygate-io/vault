import { VStack, Box, HStack, Text, Button } from "@chakra-ui/react";
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
import { selectVaults } from "@/state/vaults_slice";
import { fetchSignersForVault } from "@/state/signers_slice";
const CustomConnectButton = ({ onClick, disabled, loading }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    width="full"
    bg="black"
    color="white"
    px="6"
    py="6"
    borderRadius="md"
    _hover={{
      bg: 'gray.800'
    }}
    fontSize="md"
    fontWeight="semibold"
  >
    {loading ? 'Loading...' : 'Connect with NFID'}
  </Button>
);

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
  const vaults = useSelector((state) => selectVaults(state));

  useEffect(() => {
    if (authenticatedAgent) {
      console.log("Running initialize dispatch");
      dispatch(initialize(authenticatedAgent)).then((result) => {
        if (!result.error) {
          dispatch(fetchVaults());
        }
      });
    }
  }, [authenticatedAgent]);

  useEffect(() => {
    if (vaults) {
      if (vaults["0"]) {
        console.log("Dispatching fetchSignersForVault.");
        dispatch(fetchSignersForVault(vaults["0"].id));
      }
    }
  }, [vaults]);

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
      {!isAuthenticated && !isAuthenticating && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.6)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
        >
          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            shadow="2xl"
            maxW="md"
            w="full"
            mx={4}
          >
            <VStack spacing={4}>
              <Text fontSize="xl" fontWeight="semibold" mb={2}>
                Welcome to Keygate™
              </Text>
              <Text textAlign="center" mb={4}>
                Keygate Vault is a secure multi-signature wallet for the Internet Computer. Create and manage shared wallets, propose transactions, and collaborate with other signers in a decentralized way. Please login with NFID to access your vaults.
              </Text>
              <Box
                position="relative"
                width="full"
              >
                <ConnectWallet
                  connectButtonComponent={CustomConnectButton}
                />
              </Box>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default MultisigWallet;
