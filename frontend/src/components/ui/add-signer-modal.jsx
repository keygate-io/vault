import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogCloseTrigger,
} from "./dialog";
import {
  Text,
  Button,
  Input,
  VStack,
  Box,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { invite } from "@/state/invitations_slice";
import { selectVaultSigners } from "../../state/signers_slice";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export function AddSignerModal({ isOpen, onClose, vaultId }) {
  const [principalId, setPrincipalId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const signers = useSelector((state) => selectVaultSigners(state, vaultId));
  const isTransactionTerminology = signers && signers.length === 1;
  const isSingleSigner = signers && signers.length === 1;

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
        <DialogBody px={6} py={4}>
          <VStack spacing={6} align="stretch">
            {isSingleSigner && (
              <Box
                p={5}
                borderWidth="1px"
                borderRadius="md"
                borderColor="orange.300"
                bg="#291D17"
                _dark={{
                  bg: "#291D17",
                  borderColor: "#F97316",
                }}
              >
                <HStack spacing={3} align="flex-start">
                  <Icon
                    as={ExclamationTriangleIcon}
                    color="#F97316"
                    boxSize={5}
                  />
                  <VStack spacing={2} align="start">
                    <Text fontWeight="medium" fontSize="md" color="#F97316">
                      Converting to Shared Vault
                    </Text>
                    <Text fontSize="sm" color="#E7E5E4" lineHeight="1.5">
                      This action will convert your individual vault into a
                      shared vault, requiring approval from multiple people for
                      future transactions.
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}
            <Text
              fontSize="md"
              color="gray.300"
              mt={isSingleSigner ? 2 : 0}
              mb={4}
              lineHeight="1.5"
            >
              Enter the identifier of the person you want to invite.
              {isTransactionTerminology
                ? " Since you're the exclusive owner, this decision will be executed immediately."
                : " This will create a proposal for other people in your team to approve."}
            </Text>
            <Input
              placeholder="Identifier"
              size="lg"
              height="56px"
              borderRadius="md"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              bg="#1C1917"
              borderColor="gray.700"
              _hover={{ borderColor: "gray.600" }}
              _focus={{ borderColor: "blue.500", boxShadow: "none" }}
            />
            <Button
              width="full"
              size="lg"
              height="56px"
              colorScheme="blue"
              onClick={handleInvite}
              isLoading={isSubmitting}
              loadingText={`Creating ${
                isTransactionTerminology ? "Transaction" : "Proposal"
              }...`}
              isDisabled={!principalId.trim()}
              mt={2}
              borderRadius="md"
              fontWeight="medium"
            >
              Invite
            </Button>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
