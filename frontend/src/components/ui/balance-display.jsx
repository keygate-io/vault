import { Box, Text, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

export default function BalanceDisplay({ balance = "0.00", symbol = "ICP" }) {
  const bgColor = useColorModeValue("whiteAlpha.900", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  return (
    <HStack spacing={2}>
      <Text fontSize="4xl" fontWeight="bold">
        {balance}
      </Text>
      <Text fontSize="lg">{symbol}</Text>
    </HStack>
  );
}
