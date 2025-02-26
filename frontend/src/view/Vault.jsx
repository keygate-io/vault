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
import { focus, selectIsAuthenticated } from "@/state/session_slice";
import { ReceiveModal } from "@/components/ui/receive-modal";
import { SESSION_REPOSITORY } from "@/repository/session";
import { container } from "@/inversify.config";
import { ShareVaultButton } from "@/components/ui/signers";
import { selectVaultSigners } from "@/state/signers_slice";
import { AddSignerModal } from "@/components/ui/add-signer-modal";

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
  const [isAddSignerModalOpen, setIsAddSignerModalOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const signers = useSelector((state) => selectVaultSigners(state, vaultId));

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
    if (vault && !isCreating && isAuthenticated) {
      dispatch(fetchSignersForVault(vault.id));
    }
  }, [vault, isCreating, isAuthenticated]);

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
        <HStack spacing={2}>
          {vault?.canister_id && signers.length === 1 && (
            <ShareVaultButton onClick={() => setIsAddSignerModalOpen(true)} />
          )}
          {vault?.canister_id && (
            <Button size="sm" onClick={() => setIsReceiveModalOpen(true)}>
              <HStack spacing={2}>
                <ArrowDownTrayIcon className="w-4 h-4" />
                <Text>Receive</Text>
              </HStack>
            </Button>
          )}
        </HStack>
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
        <VStack
          spacing={3}
          align="stretch"
          mt={signers && signers.length === 1 ? 0 : 8}
        >
          <CollapsibleButton
            content={
              <HStack spacing={2} align="center">
                <PlusIcon className="w-4 h-4" />
                <Text>
                  {signers && signers.length === 1
                    ? "New transaction"
                    : "New proposal"}
                </Text>
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

      <AddSignerModal
        isOpen={isAddSignerModalOpen}
        onClose={() => setIsAddSignerModalOpen(false)}
        vaultId={vaultId}
      />
    </VStack>
  );
}

export default Vault;
