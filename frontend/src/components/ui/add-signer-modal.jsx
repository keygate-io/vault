import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
} from "./dialog";
import { Text, Button, Input, VStack } from "@chakra-ui/react";

export function AddSignerModal({ isOpen, onClose }) {
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
              Enter the Principal ID of the user you want to add as a signer to
              this vault.
            </Text>
            <Input placeholder="Principal ID" size="sm" fontFamily="mono" />
            <Button width="full" size="sm" colorScheme="blue">
              Invite
            </Button>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
