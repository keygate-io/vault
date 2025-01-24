import {
  HStack,
  VStack,
  Text,
  useDisclosure,
  Button,
  Stack,
  Box,
  Image,
} from "@chakra-ui/react";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { ProgressBar, ProgressRoot } from "@/components/ui/progress";
import { ColorModeButton } from "@/components/ui/color-mode";

function MultisigWallet() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mockTransactions = [
    {
      id: 1,
      recipient: "0x123...abc",
      amount: "1.5 ETH",
      approvals: 2,
      required: 3,
    },
    {
      id: 2,
      recipient: "0x456...def",
      amount: "0.8 ETH",
      approvals: 1,
      required: 3,
    },
  ];

  const mockSigners = [
    {
      id: 1,
      name: "Alice",
      address: "0x1a2b3c...d4e5f6",
      avatarUrl: "https://bit.ly/dan-abramov",
      isCurrentUser: true,
    },
    {
      id: 2,
      name: "Bob",
      address: "0x6f5e4d...3c2b1a",
      avatarUrl: "https://bit.ly/sage-adebayo",
      isCurrentUser: false,
    },
    {
      id: 3,
      name: "Charlie",
      address: "0xa1b2c3...d4e5f6",
      avatarUrl: null,
      isCurrentUser: false,
    },
  ];

  return (
    <Box maxW="1100px" mx="auto" pt={8}>
      <VStack spacing={4} p={4} align="stretch">
        <HStack justify="space-between">
          <Box display="flex" alignItems="center" justifyContent="center">
            <Image
              src="/keygate-logo.png"
              alt="Keygate Logo"
              height={{ base: "24px", sm: "28px", lg: "32px" }}
              mr={2}
            />
          </Box>
          <ColorModeButton />
        </HStack>
        <VStack spacing={3} align="stretch" mt={4}>
          <Text fontSize="lg" fontWeight="bold">
            Signers
          </Text>
          <HStack
            key="mock-signer-0"
            p={3}
            borderWidth={1}
            borderRadius="md"
            spacing={3}
            bg="whiteAlpha.50"
          >
            <AvatarGroup>
              <Avatar
                size="md"
                name="Alice"
                src="https://bit.ly/dan-abramov"
                borderWidth={2}
                borderColor="blue.200"
              />
            </AvatarGroup>
            <AvatarGroup>
              <Avatar
                size="md"
                name="Sam"
                src="https://bit.ly/sage-adebayo"
                borderWidth={2}
                borderColor="blue.200"
              />
            </AvatarGroup>
            <AvatarGroup>
              <Avatar
                size="md"
                name="Bob"
                src="https://bit.ly/sage-adebayo"
                borderWidth={2}
                borderColor="blue.200"
              />
            </AvatarGroup>
          </HStack>
        </VStack>

        <VStack spacing={3} align="stretch">
          <Button width="fit-content" onClick={onOpen}>
            New transaction
          </Button>
          {mockTransactions.map((tx) => (
            <Box key={tx.id} p={4} borderWidth={1} borderRadius="md">
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">{tx.recipient}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {tx.amount}
                  </Text>
                  <Stack width="100%">
                    <ProgressRoot size="sm">
                      <ProgressBar
                        value={(tx.approvals / tx.required) * 100}
                        colorScheme="blue"
                      />
                    </ProgressRoot>
                  </Stack>
                  <Text fontSize="sm" color="gray.500">
                    {tx.approvals}/{tx.required} approvals
                  </Text>
                </VStack>

                <Button
                  variant={tx.approvals >= tx.required ? "solid" : "outline"}
                  colorScheme={tx.approvals >= tx.required ? "green" : "blue"}
                  disabled={tx.approvals >= tx.required}
                  leftIcon={
                    tx.approvals >= tx.required ? (
                      <CheckCircleIcon />
                    ) : (
                      <ClockIcon />
                    )
                  }
                >
                  {tx.approvals >= tx.required ? "Executed" : "Approve"}
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}

export default MultisigWallet;
