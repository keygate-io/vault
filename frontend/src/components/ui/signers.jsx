import { VStack, HStack, Text, Box, Skeleton } from "@chakra-ui/react";
import { AvatarGroup } from "@/components/ui/avatar/avatar-group";
import { InformationalAvatar } from "@/components/ui/avatar/informational-avatar";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUserId } from "@/state/session_slice";
import { UserGroupIcon } from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import { selectVaultSigners } from "../../state/signers_slice";
import { useParams } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar/avatar";
import { AddSignerModal } from "./add-signer-modal";

function SignersHeader() {
  return (
    <HStack alignItems="center" spacing={0} justifyContent="">
      <UserGroupIcon width={20} />
      <Text marginLeft={-1} paddingLeft={0} fontSize="lg" fontWeight="bold">
        Signers
      </Text>
    </HStack>
  );
}

function LoadingSigners() {
  return (
    <AvatarGroup>
      {[1, 2, 3, 4, 5].map((index) => (
        <Skeleton key={index} width="40px" height="40px" borderRadius="full" />
      ))}
    </AvatarGroup>
  );
}

function AddSignerButton({ onClick }) {
  return (
    <Box
      position="relative"
      transition="transform 0.2s"
      _hover={{ transform: "scale(1.05)" }}
      cursor="pointer"
      display="flex"
      alignItems="center"
      mt={"-4.5"}
      onClick={onClick}
    >
      <Avatar
        size="md"
        bg="transparent"
        borderWidth={2}
        borderStyle="dashed"
        _hover={{ borderColor: "blue.500" }}
        icon={<PlusIcon width={16} />}
      >
        <PlusIcon width={16} />
      </Avatar>
    </Box>
  );
}

function SignersList({ signers, currentUserId, onAddClick }) {
  return (
    <HStack gap={3}>
      <AvatarGroup>
        {console.log("Current user ID:", currentUserId)}
        {signers.map((signer) => (
          <InformationalAvatar
            key={signer.id}
            size="md"
            name={signer.name}
            src={signer.avatarUrl}
            borderWidth={2}
            isCurrentUser={signer.id === currentUserId}
            borderStyle={"solid"}
          />
        ))}
      </AvatarGroup>
      <AddSignerButton onClick={onAddClick} />
    </HStack>
  );
}

export default function Signers() {
  const [isOpen] = useState(false);
  const [isAddSignerModalOpen, setIsAddSignerModalOpen] = useState(false);
  const { vaultId } = useParams();
  const currentUserId = useSelector((state) => selectCurrentUserId(state));
  const signers = useSelector((state) => selectVaultSigners(state, vaultId));
  const isLoading = useSelector((state) => state.signers.loading);
  const isAuthenticating = useSelector(
    (state) => state.session.isAuthenticating
  );

  return (
    <>
      <Box
        transition="margin-left 0.3s ease-in-out"
        ml={{ base: isOpen ? "30vh" : "0", xl: "0" }}
        position="relative"
      >
        <VStack spacing={3} align="stretch" mt={4}>
          <SignersHeader />
          <HStack
            p={3}
            borderWidth={1}
            borderRadius="md"
            spacing={3}
            bg={isOpen ? "whiteAlpha.100" : "whiteAlpha.50"}
            alignItems="center"
          >
            {isAuthenticating || isLoading ? (
              <LoadingSigners />
            ) : (
              <SignersList
                signers={signers}
                currentUserId={currentUserId}
                onAddClick={() => setIsAddSignerModalOpen(true)}
              />
            )}
          </HStack>
        </VStack>
      </Box>

      <AddSignerModal
        isOpen={isAddSignerModalOpen}
        onClose={() => setIsAddSignerModalOpen(false)}
      />
    </>
  );
}
