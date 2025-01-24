import { VStack, HStack, Text, Box } from "@chakra-ui/react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useColorModeValue } from "@/components/ui/color-mode";
import SideMenu from "./sidemenu";
import { useState } from "react";

export default function Signers() {
  const hoverBgColor = useColorModeValue("gray.100", "whiteAlpha.400");
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <SideMenu isOpen={isOpen} onClose={handleClose}>
        <VStack p={4}>
          <Text fontSize="lg" fontWeight="semibold">
            Settings
          </Text>
        </VStack>
      </SideMenu>

      <Box
        transition="margin-left 0.3s ease-in-out"
        ml={isOpen ? "100px" : "0"}
        position="relative"
        zIndex={10000}
      >
        <VStack spacing={3} align="stretch" mt={4}>
          <HStack alignItems="center" spacing={0} justifyContent="">
            <Box
              as="button"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={1}
              borderRadius="md"
              _hover={{ bg: hoverBgColor }}
              transition="background 0.2s"
              cursor="pointer"
              onClick={handleToggle}
            >
              <Cog6ToothIcon width={20} />
            </Box>
            <Text
              marginLeft={-1}
              paddingLeft={0}
              fontSize="lg"
              fontWeight="bold"
            >
              Signers
            </Text>
          </HStack>

          <HStack
            key="mock-signer-0"
            p={3}
            borderWidth={1}
            borderRadius="md"
            spacing={3}
            bg={isOpen ? "whiteAlpha.100" : "whiteAlpha.50"}
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
      </Box>
    </>
  );
}
