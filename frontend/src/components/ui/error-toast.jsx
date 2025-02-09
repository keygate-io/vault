import { useState } from "react";
import {
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { VStack, Text, Button, HStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

export const ErrorToast = ({ message, technicalDetails }) => {
  const [copied, setCopied] = useState(false);
  const mutedColor = useColorModeValue("gray.500", "white");
  const hoverColor = useColorModeValue("black", "white");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(technicalDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <VStack spacing={2} align="flex-start">
      <Text>{message}</Text>
      <Button
        onClick={handleCopy}
        variant="plain"
        size="xs"
        color={mutedColor}
        _hover={{ color: hoverColor }}
        p={0}
        height="auto"
      >
        <HStack spacing={1.5}>
          {copied ? (
            <ClipboardDocumentCheckIcon width={14} height={14} />
          ) : (
            <ClipboardIcon width={14} height={14} />
          )}
          <Text>{copied ? "Copied!" : "Copy error details"}</Text>
        </HStack>
      </Button>
    </VStack>
  );
};
