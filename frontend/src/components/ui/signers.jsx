import { VStack, HStack, Text, Box, Skeleton } from "@chakra-ui/react";
import { AvatarGroup } from "@/components/ui/avatar/avatar-group";
import { InformationalAvatar } from "@/components/ui/avatar/informational-avatar";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentVaultId } from "@/state/session_slice";
import { selectCurrentUserId } from "@/state/session_slice";
import { UserGroupIcon } from "@heroicons/react/24/solid";
import { selectVaultSigners } from "../../state/signers_slice";
import { useParams } from "react-router-dom";

export default function Signers() {
  const [isOpen, setIsOpen] = useState(false);
  const { vaultId } = useParams();
  const currentUserId = useSelector((state) => selectCurrentUserId(state));
  const signers = useSelector((state) => selectVaultSigners(state, vaultId));
  const isLoading = useSelector((state) => state.signers.loading);
  const isAuthenticating = useSelector((state) => state.session.isAuthenticating);

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
            {isAuthenticating || isLoading ? (
              <AvatarGroup>
                {[1, 2, 3, 4, 5].map((index) => (
                  <Skeleton
                    key={index}
                    width="40px"
                    height="40px"
                    borderRadius="full"
                  />
                ))}
              </AvatarGroup>
            ) : (
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
            )}
          </HStack>
        </VStack>
      </Box>
    </>
  );
}
