import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
} from "./dialog";
import { Text, Box, Button, HStack } from "@chakra-ui/react";
import { CheckIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function ReceiveModal({ isOpen, onClose, canisterId }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(canisterId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle fontWeight="semibold">Receive ICP</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <Text mb={4} fontSize="sm" color="gray.500">
            To send ICP to this vault, use the Principal ID below.
          </Text>
          <Box
            p={4}
            bg="gray.50"
            _dark={{ bg: "gray.800" }}
            borderRadius="md"
            position="relative"
            mb={4}
          >
            <Text fontSize="sm" fontFamily="mono" wordBreak="break-all">
              {canisterId}
            </Text>
          </Box>
          <Button width="full" onClick={handleCopy}>
            <HStack spacing={1.5}>
              {copied ? (
                <CheckIcon width={14} height={14} />
              ) : (
                <DocumentDuplicateIcon width={14} height={14} />
              )}
              <Text>{copied ? "Copied!" : "Copy to clipboard"}</Text>
            </HStack>
          </Button>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
