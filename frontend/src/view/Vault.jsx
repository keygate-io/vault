import { VStack, Box, HStack, Text, Link, Button } from "@chakra-ui/react";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
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
import {
  selectVaultById,
  selectIsCreatingVault,
  fetchVaultBalance,
  selectIsBalanceLoading,
  selectBalanceError,
} from "@/state/vaults_slice";
import { fetchSignersForVault } from "@/state/signers_slice";
import { focus } from "@/state/session_slice";
import { ReceiveModal } from "@/components/ui/receive-modal";

function Vault() {
  const { vaultId } = useParams();
  const dispatch = useDispatch();
  const vault = useSelector((state) => selectVaultById(state, vaultId));
  const isCreating = useSelector(selectIsCreatingVault);
  const isLoading = useSelector((state) => state.vaults.loading);
  const isBalanceLoading = useSelector(selectIsBalanceLoading);
  const balanceError = useSelector(selectBalanceError);
  const navigate = useNavigate();
  const createTransactionRef = useRef(null);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isCreating && !vault) {
      navigate("/vaults");
      return;
    }

    if (vault && !isCreating) {
      const initVault = async () => {
        await dispatch(focus(vault));
        dispatch(fetchVaultBalance(vault.id));
      };
      initVault();
    }
  }, [vault, vaultId, dispatch, isCreating, isLoading, navigate]);

  useEffect(() => {
    if (vault && !isCreating) {
      dispatch(fetchSignersForVault(vault.id));
    }
  }, [vault, isCreating]);

  const handleCollapsibleOpen = () => {
    setIsCollapsibleOpen(true);
    setTimeout(() => {
      if (createTransactionRef.current) {
        const yOffset = -100;
        const element = createTransactionRef.current;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const handleCollapsibleClose = () => {
    setIsCollapsibleOpen(false);
  };

  const handleTransactionSuccess = (onClose) => {
    handleCollapsibleClose();
    onClose();
  };

  const handleTransactionError = () => {
    setIsCollapsibleOpen(true);
    handleCollapsibleOpen();
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack mb={4} justify="space-between">
        <Link
          variant="ghost"
          colorScheme="gray"
          onClick={() => navigate("/vaults")}
        >
          <ArrowLeftIcon width={16} />
          Back to Vaults
        </Link>
        {vault?.canister_id && (
          <Button size="sm" onClick={() => setIsReceiveModalOpen(true)}>
            <HStack spacing={2}>
              <ArrowDownTrayIcon className="w-4 h-4" />
              <Text>Receive</Text>
            </HStack>
          </Button>
        )}
      </HStack>

      <Feature name="vaults">
        <Box>
          <BalanceDisplay
            symbol="ICP"
            isLoading={isBalanceLoading}
            error={balanceError}
          />
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
            isOpen={isCollapsibleOpen}
            onClose={handleCollapsibleClose}
          >
            {({ onClose }) => (
              <div ref={createTransactionRef}>
                <CreateTransaction
                  onClose={() => handleTransactionSuccess(onClose)}
                  vaultId={vaultId}
                  onError={handleTransactionError}
                />
              </div>
            )}
          </CollapsibleButton>

          <TransactionsList />
        </VStack>
      </Feature>

      <DevModePanel />
      <Toaster />

      <ReceiveModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        canisterId={vault?.canister_id}
      />
    </VStack>
  );
}

export default Vault;
