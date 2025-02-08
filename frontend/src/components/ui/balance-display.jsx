import { Text, HStack } from "@chakra-ui/react";
import { floatPrecision } from "@/utils/floatPrecision";
import { useSelector } from "react-redux";
import { selectVaultBalance } from "@/state/vaults_slice";
import { selectCurrentVaultId } from "@/state/session_slice";

export default function BalanceDisplay({ symbol = "ICP" }) {
  const currentVaultId = useSelector((state) => selectCurrentVaultId(state));
  const balance = useSelector((state) =>
    selectVaultBalance(state, currentVaultId)
  );

  return (
    <HStack spacing={2}>
      <Text fontSize="4xl" fontWeight="bold">
        {floatPrecision(balance)}
      </Text>
      <Text fontSize="lg">{symbol}</Text>
    </HStack>
  );
}
