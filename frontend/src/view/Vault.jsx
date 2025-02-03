import { VStack, Box, HStack, Text, Link } from "@chakra-ui/react";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BalanceDisplay from "@/components/ui/balance-display";
import CreateTransaction from "@/components/ui/create-transaction";
import Signers from "@/components/ui/signers";
import CollapsibleButton from "@/components/ui/collapsible-button";
import TransactionsList from "@/components/ui/transactions-list";
import DevModePanel from "@/components/ui/dev-mode-panel";
import { useDispatch, useSelector } from "react-redux";
import { Feature } from "@/components/ui/feature";
import { Toaster } from "@/components/ui/toaster";
import { fetchVaults, selectVaults, selectVaultById } from "@/state/vaults_slice";
import { fetchSignersForVault } from "@/state/signers_slice";
import { focus } from "@/state/session_slice";

function Vault() {
  const { vaultId } = useParams();
  const dispatch = useDispatch();
  const { transactions_list } = useSelector((state) => state.transactions);
  const vaults = useSelector((state) => selectVaults(state));
  const vault = useSelector((state) => selectVaultById(state, vaultId));
  const navigate = useNavigate();
  const createTransactionRef = useRef(null);

  useEffect(() => {
    if (vault) {
      dispatch(focus(vault));
    }
  }, [vault, vaultId, dispatch]);

  useEffect(() => {
    if (vault) {
      dispatch(fetchSignersForVault(vault.id));
    }
  }, [vault]);

  const handleCollapsibleOpen = () => {
    setTimeout(() => {
      if (createTransactionRef.current) {
        const yOffset = -100; // Adjust this value to control how much space to leave at the top
        const element = createTransactionRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }
    }, 100); // Small delay to ensure the content is rendered
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack mb={4}>
        <Link
          variant="ghost"
          colorScheme="gray"
          onClick={() => navigate('/vaults')}
        >
          <ArrowLeftIcon width={16} />
          Back to Vaults
        </Link>
      </HStack>

      <Feature name="vaults">
        <Box>
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
            onOpen={handleCollapsibleOpen}
          >
            {({ onClose }) => (
              <div ref={createTransactionRef}>
                <CreateTransaction onClose={onClose} />
              </div>
            )}
          </CollapsibleButton>

          <TransactionsList transactions={transactions_list} />
        </VStack>
      </Feature>

      <DevModePanel />
      <Toaster />
    </VStack>
  );
}

export default Vault;
