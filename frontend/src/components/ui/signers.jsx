import { VStack, HStack, Text, Box } from "@chakra-ui/react";
import { AvatarGroup } from "@/components/ui/avatar/avatar-group";
import { InformationalAvatar } from "@/components/ui/avatar/informational-avatar";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectVaultSigners } from "@/state/signers_slice";
import { selectCurrentVaultId } from "@/state/session_slice";
import { selectUsersByIds } from "@/state/users_slice";
import { selectCurrentUserId } from "@/state/session_slice";
import { UserGroupIcon } from "@heroicons/react/24/solid";

export default function Signers() {
  const hoverBgColor = useColorModeValue("gray.100", "whiteAlpha.400");
  const [isOpen, setIsOpen] = useState(false);
  const currentVaultId = useSelector((state) => selectCurrentVaultId(state));
  const currentUserId = useSelector((state) => selectCurrentUserId(state));
  const signerIds = useSelector((state) =>
    selectVaultSigners(state, currentVaultId)
  );

  const signers = useSelector((state) => selectUsersByIds(state, signerIds));

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Box
        transition="margin-left 0.3s ease-in-out"
        ml={{ base: isOpen ? "30vh" : "0", xl: "0" }}
        position="relative"
      >
        <VStack spacing={3} align="stretch" mt={4}>
          <HStack alignItems="center" spacing={0} justifyContent="">
            <UserGroupIcon width={20} />
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
            p={3}
            borderWidth={1}
            borderRadius="md"
            spacing={3}
            bg={isOpen ? "whiteAlpha.100" : "whiteAlpha.50"}
            alignItems="flex-start"
          >
            <AvatarGroup>
              {signers.map((signer) => (
                <InformationalAvatar
                  key={signer.id}
                  size="md"
                  name={signer.name}
                  src={signer.avatarUrl}
                  borderWidth={2}
                  isCurrentUser={signer.id === currentUserId}
                />
              ))}
            </AvatarGroup>
          </HStack>
        </VStack>
      </Box>
    </>
  );
}
