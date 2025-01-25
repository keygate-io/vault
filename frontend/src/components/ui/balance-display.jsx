import { Text, HStack } from "@chakra-ui/react";
import floatPrecision from "@/utils/floatPrecision";
export default function BalanceDisplay({ balance = "0.00", symbol = "ICP" }) {
  return (
    <HStack spacing={2}>
      <Text fontSize="4xl" fontWeight="bold">
        {floatPrecision(balance)}
      </Text>
      <Text fontSize="lg">{symbol}</Text>
    </HStack>
  );
}
