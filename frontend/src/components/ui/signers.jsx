import { VStack, HStack, Text } from "@chakra-ui/react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";

export default function Signers() {
  return (
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
  );
}
