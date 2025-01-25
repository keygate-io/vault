import { Box, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

const TransactionBadge = ({ content }) => {
  const bgColor = useColorModeValue("gray.50", "whiteAlpha.100");

  return (
    <Box bg={bgColor} px={2} py={1} borderRadius="md">
      <Text fontSize="xs" fontWeight="medium">
        {content}
      </Text>
    </Box>
  );
};

export default TransactionBadge;
