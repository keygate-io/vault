import { HStack, Text, IconButton, VStack } from "@chakra-ui/react";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/components/ui/tooltip";

function AddressDisplay({ address, type }) {
  const isPrincipal = type === "principal";
  const formattedAddress = address.replace(/-/g, "").toLowerCase();

  const truncate = (addr) => {
    if (isPrincipal) {
      return `${addr.slice(0, 4)}...${addr.slice(-3)}`;
    }
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  return (
    <Tooltip content={formattedAddress}>
      <HStack gap={2} alignItems="center">
        <VStack gap={1.5} alignItems="baseline">
          <Text
            fontSize="xs"
            color="gray.400"
            fontWeight="medium"
            minW="max-content"
          >
            {isPrincipal ? "Principal" : "Account ID"}
          </Text>
          <Text fontSize="sm">{truncate(formattedAddress)}</Text>
        </VStack>
      </HStack>
    </Tooltip>
  );
}

export default AddressDisplay;
