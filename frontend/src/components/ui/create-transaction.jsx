import { Box, Button, VStack, Text, Input, Separator } from "@chakra-ui/react";
import {
  XMarkIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui/menu";
import { InputGroup } from "@/components/ui/input-group";

const CreateTransaction = ({ onClose }) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      position="relative"
      mt={2}
      transition="all 0.2s"
      transform="translateY(0)"
    >
      <Button
        size="sm"
        variant="ghost"
        position="absolute"
        right={2}
        top={2}
        onClick={onClose}
        icon={<XMarkIcon width={16} />}
        aria-label="Close form"
      />

      <VStack align="start" spacing={4}>
        <VStack align="start" spacing={3} width="100%">
          <MenuRoot>
            <MenuTrigger asChild>
              <Box display="flex" alignItems="center" gap={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  Recipient
                </Text>
                <QuestionMarkCircleIcon width={16} cursor="pointer" />
              </Box>
            </MenuTrigger>
            <MenuContent _hover={{ bg: "gray.950" }} p={3}>
              <MenuItem bg="transparent" _hover={{ bg: "transparent" }}>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold">Principal ID</Text>
                  <Text fontSize="sm" color="gray.400">
                    The unique identifier for an Internet Computer user or
                    canister.
                  </Text>
                  <Text fontSize="sm">
                    Example: rrkah-fqaaa-aaaaa-aaaaq-cai
                  </Text>
                </VStack>
              </MenuItem>
              <Separator />
              <MenuItem bg="transparent" _hover={{ bg: "transparent" }}>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold">Account Identifier</Text>
                  <Text fontSize="sm" color="gray.400">
                    A 64-character hex string that represents an ICP ledger
                    account.
                  </Text>
                  <Text fontSize="sm" wordBreak="break-all">
                    Example:
                    d9f3b3b3f3b3b3f3b3b3f3b3b3f3b3b3f3b3b3f3b3b3f3b3b3f3b3b3f3b3b3f3
                  </Text>
                </VStack>
              </MenuItem>
            </MenuContent>
          </MenuRoot>
          <InputGroup
            flex="1"
            width="100%"
            maxWidth="600px"
            startElement={<UserCircleIcon width={16} />}
          >
            <Input
              size="sm"
              value={recipient}
              variant="subtle"
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient identifier"
              paddingLeft={10}
              width="100%"
              maxWidth="600px"
            />
          </InputGroup>

          <Box display="flex" alignItems="center" gap={2}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Amount (ICP)
            </Text>
          </Box>
          <InputGroup flex="1" startElement={<CurrencyDollarIcon width={16} />}>
            <Input
              value={amount}
              variant="subtle"
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="Enter amount in ICP"
              step="0.00000001"
              min="0"
            />
          </InputGroup>
        </VStack>

        <Button
          alignSelf="flex-start"
          colorScheme="blue"
          size="xs"
          mt={4}
          leftIcon={<ClockIcon />}
          onClick={() => {
            onClose();
          }}
        >
          Create
        </Button>
      </VStack>
    </Box>
  );
};

export default CreateTransaction;
