import { Box, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

const SentimentTransactionBadge = ({ content, sentiment }) => {
  const defaultBgColor = useColorModeValue("gray.50", "whiteAlpha.100");
  const defaultTextColor = "black";

  return (
    <Box
      bg={sentiment || defaultBgColor}
      px={2}
      py={1}
      color={defaultTextColor}
      borderRadius="md"
    >
      <Text fontSize="xs" fontWeight="medium">
        {content}
      </Text>
    </Box>
  );
};

const TransactionBadge = ({ content }) => {
  const defaultBgColor = useColorModeValue("gray.50", "whiteAlpha.100");
  const defaultTextColor = useColorModeValue("black", "white");

  return (
    <Box
      bg={defaultBgColor}
      px={2}
      py={1}
      color={defaultTextColor}
      borderRadius="md"
    >
      <Text fontSize="xs" fontWeight="medium">
        {content}
      </Text>
    </Box>
  );
};

export { SentimentTransactionBadge, TransactionBadge };
