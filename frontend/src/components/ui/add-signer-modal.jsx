import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
} from "./dialog";
import { Text, Button, Input, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { invite } from "@/state/invitations_slice";

export function AddSignerModal({ isOpen, onClose, vaultId }) {
  const [principalId, setPrincipalId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleInvite = async () => {
    if (!principalId.trim()) return;

    setIsSubmitting(true);
    try {
      await dispatch(invite({ vaultId, principalId })).unwrap();
      onClose();
    } catch (error) {
      // Error handling is now done in the slice
      console.error("Error inviting signer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle fontWeight="semibold">Invite</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Enter the Principal ID of the person you want to invite. This will
              create a proposal for other people in your team to approve.
            </Text>
            <Input
              placeholder="Principal ID"
              size="sm"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              my={2}
            />
            <Button
              width="full"
              size="sm"
              colorScheme="blue"
              onClick={handleInvite}
              isLoading={isSubmitting}
              loadingText="Creating Proposal..."
              isDisabled={!principalId.trim()}
            >
              Invite
            </Button>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
