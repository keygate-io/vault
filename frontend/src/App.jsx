import {
  HStack,
  VStack,
  Text,
  useDisclosure,
  Button,
  Box,
  Image,
  Collapsible,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import {
  ColorModeButton,
  useColorMode,
  useColorModeValue,
} from "@/components/ui/color-mode";
import ApprovalGrid from "@/components/ui/approval-grid";
import AddressDisplay from "@/components/ui/address-display";
import BalanceDisplay from "@/components/ui/balance-display";
import CreateTransaction from "@/components/ui/create-transaction";

function MultisigWallet() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const mockTransactions = [
    {
      id: 1,
      recipient:
        "6a6f62866a144e971cd7e036d8234afe96e537c7624fcd8e5100ef08578ea003",
      amount: "1.5 ICP",
      approvals: 2,
      required: 3,
    },
    {
      id: 2,
      recipient:
        "6a6f62866a144e971cd7e036d8234afe96e537c7624fcd8e5100ef08578ea003",
      amount: "0.8 ICP",
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
      address: "0x456...def",
      avatarUrl: "https://bit.ly/sage-adebayo",
      isCurrentUser: false,
    },
    {
      id: 3,
      name: "Charlie",
      address: "0x789...ghi",
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
              src={
                colorMode === "dark"
                  ? "/keygate-logo-w.png"
                  : "/keygate-logo.png"
              }
              alt="Keygate Logo"
              height={{ base: "24px", sm: "28px", lg: "32px" }}
              mr={2}
            />
          </Box>
          <ColorModeButton />
        </HStack>
        <Box mt={4}>
          <BalanceDisplay balance="125.45" symbol="ICP" />
        </Box>
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
            alignItems="flex-start"
          >
            <AvatarGroup>
              <Avatar
                size="md"
                name="Alice"
                src="https://bit.ly/dan-abramov"
                borderWidth={2}
                isCurrentUser={true}
              />
              <Avatar
                size="md"
                name="Sam"
                src="https://bit.ly/sage-adebayo"
                borderWidth={2}
              />
              <Avatar
                size="md"
                name="Bob"
                src="https://bit.ly/sage-adebayo"
                borderWidth={2}
              />
              <Avatar
                size="md"
                name="Bob"
                src="https://bit.ly/sage-adebayo"
                borderWidth={2}
              />
              <Avatar
                size="md"
                name="Bob"
                src="https://bit.ly/sage-adebayo"
                borderWidth={2}
              />
              <Avatar
                size="md"
                name="Bob"
                src="https://bit.ly/sage-adebayo"
                borderWidth={2}
              />
              <Avatar
                size="md"
                name="Bob"
                src="https://bit.ly/sage-adebayo"
                borderWidth={2}
              />
            </AvatarGroup>
          </HStack>
        </VStack>

        <VStack spacing={3} align="stretch" mt={8}>
          <Collapsible.Root open={isOpen}>
            <Box position="relative">
              <Collapsible.Trigger asChild>
                <Button
                  width="fit-content"
                  onClick={onOpen}
                  mb={isOpen ? 2 : 0}
                  variant={isOpen ? "solid" : "outline"}
                  colorScheme={isOpen ? "blue" : "gray"}
                >
                  <PlusIcon />
                  New transaction
                </Button>
              </Collapsible.Trigger>

              <Collapsible.Content>
                <CreateTransaction
                  onClose={onClose}
                  mockSigners={mockSigners}
                />
              </Collapsible.Content>
            </Box>
          </Collapsible.Root>

          {mockTransactions.map((tx) => (
            <Box key={tx.id} p={4} borderWidth={1} borderRadius="md">
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <AddressDisplay
                    address={tx.recipient}
                    type={
                      tx.recipient.startsWith("rrkah") ? "principal" : "account"
                    }
                  />
                  <Text fontSize="sm" color="gray.500">
                    {tx.amount}
                  </Text>
                  <ApprovalGrid
                    signers={mockSigners}
                    approvals={tx.approvals}
                  />
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
