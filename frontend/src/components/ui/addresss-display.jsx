import { HStack, Text, Tooltip, IconButton, useToast } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";

function AddressDisplay({ address, type }) {
  const toast = useToast();
  const isPrincipal = type === "principal";
  const formattedAddress = address.replace(/-/g, "").toLowerCase();

  const truncate = (addr) => {
    if (isPrincipal) {
      return `${addr.slice(0, 5)}...${addr.slice(-3)}`;
    }
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    toast({
      title: "Address copied",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <HStack spacing={2} align="center">
      <Tooltip label={address} placement="top" hasArrow>
        <HStack
          spacing={1}
          fontFamily="mono"
          color={isPrincipal ? "blue.300" : "green.300"}
          cursor="pointer"
        >
          <Text fontSize="sm">{truncate(formattedAddress)}</Text>
          <Text fontSize="xs" color="gray.500">
            {isPrincipal ? "PR" : "AC"}
          </Text>
        </HStack>
      </Tooltip>

      <IconButton
        aria-label="Copy address"
        icon={<CopyIcon />}
        size="xs"
        variant="ghost"
        onClick={copyToClipboard}
      />
    </HStack>
  );
}

export default AddressDisplay;
