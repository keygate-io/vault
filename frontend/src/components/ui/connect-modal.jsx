import { Box, Text, VStack, Button } from "@chakra-ui/react";
import { ConnectWallet } from "@nfid/identitykit/react";
import { useColorModeValue } from "@/components/ui/color-mode";
const CustomConnectButton = ({ onClick, disabled, loading }) => {
  const buttonBg = useColorModeValue('black', 'white');
  const buttonColor = useColorModeValue('white', 'black');
  const hoverBg = useColorModeValue('gray.800', 'gray.200');

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      width="full"
      bg={buttonBg}
      color={buttonColor}
      px="6"
      py="6"
      borderRadius="md"
      _hover={{
        bg: hoverBg
      }}
      fontSize="md"
      fontWeight="semibold"
    >
      {loading ? 'Connecting...' : 'Connect with NFID'}
    </Button>
  );
};

function ConnectModal() {
  const modalBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.6)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
    >
      <Box
        bg={modalBg}
        p={8}
        borderRadius="xl"
        shadow="2xl"
        maxW="md"
        w="full"
        mx={4}
      >
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="semibold" mb={2} color={textColor}>
            Welcome to Keygate™
          </Text>
          <Text textAlign="center" mb={4} color={secondaryTextColor}>
            Keygate Vault is a secure multi-signature wallet for the Internet Computer. Create and manage shared wallets, propose transactions, and collaborate with other signers in a decentralized way. Please login with NFID to access your vaults.
          </Text>
          <Box
            position="relative"
            width="full"
          >
            <ConnectWallet
              connectButtonComponent={CustomConnectButton}
            />
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default ConnectModal;
