import { Text, HStack, Spinner, Icon } from "@chakra-ui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { floatPrecision } from "@/utils/floatPrecision";
import { useSelector } from "react-redux";
import {
  selectVaultBalance,
  selectVaultById,
  selectIsCreatingVault,
} from "@/state/vaults_slice";
import { selectCurrentVaultId } from "@/state/session_slice";
import { Alert } from "@/components/ui/alert";

export default function BalanceDisplay({
  symbol = "ICP",
  isLoading = false,
  error = null,
}) {
  const currentVaultId = useSelector((state) => selectCurrentVaultId(state));
  const vault = useSelector((state) => selectVaultById(state, currentVaultId));
  const isCreating = useSelector(selectIsCreatingVault);
  const isVaultsLoading = useSelector((state) => state.vaults.loading);
  const balance = useSelector((state) =>
    selectVaultBalance(state, currentVaultId)
  );
  const balanceLoading = useSelector((state) => state.vaults.balance_loading);

  if (!vault || balanceLoading) {
    return (
      <HStack spacing={2}>
        <Spinner size="lg" />
      </HStack>
    );
  }

  if (!vault) {
    return (
      <Alert
        status="error"
        title="Vault not found"
        icon={
          <Icon as={ExclamationTriangleIcon} className="h-5 w-5 text-red-500" />
        }
      />
    );
  }

  if (error) {
    return (
      <Alert
        status="error"
        title={`Failed to load balance: ${error}`}
        icon={
          <Icon as={ExclamationTriangleIcon} className="h-5 w-5 text-red-500" />
        }
      />
    );
  }

  return (
    <HStack spacing={2}>
      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <>
          <Text fontSize="4xl" fontWeight="bold">
            {floatPrecision(balance)}
          </Text>
          <Text fontSize="lg">{symbol}</Text>
        </>
      )}
    </HStack>
  );
}
