import { Box, Button, VStack, Text, Input } from "@chakra-ui/react";
import {
  XMarkIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { InputGroup } from "@/components/ui/input-group";
import { useDispatch, useSelector } from "react-redux";
import { createTransaction } from "@/state/transactions_slice";
import { Field } from "@/components/ui/field";
import { isValidPrincipal } from "@/utils/cryptoAddressFormats";
import { floatToE8s } from "@/utils/floatPrecision";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { selectVaultSigners } from "@/state/signers_slice";

const CreateTransaction = ({ onClose, onError }) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [formStep, setFormStep] = useState("idle");
  const [isValidRecipient, setIsValidRecipient] = useState(true);
  const { vaultId } = useParams();
  const signers = useSelector((state) => selectVaultSigners(state, vaultId));
  const isSingleSigner = signers && signers.length === 1;

  const dispatch = useDispatch();

  const deriveStepDisplayText = () => {
    if (formStep === "sending") {
      return isSingleSigner
        ? "Creating transaction in decentralized vault..."
        : "Proposing transaction to decentralized vault...";
    }

    if (formStep === "sent") {
      return isSingleSigner
        ? "Transaction created successfully."
        : "Transaction proposed successfully.";
    }

    return "";
  };

  const handleCreateTransaction = async () => {
    const isValid = isValidPrincipal(recipient);

    setIsValidRecipient(isValid);

    if (!isValid) {
      return;
    }

    const transaction = {
      recipient: recipient,
      amount: floatToE8s(parseFloat(amount)),
    };

    try {
      setFormStep("sending");
      await dispatch(createTransaction({ transaction })).unwrap();
      setFormStep("sent");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setFormStep("idle");
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" position="relative" mt={2}>
      <Button
        size="sm"
        variant="ghost"
        position="absolute"
        right={2}
        top={2}
        onClick={onClose}
        icon={<XMarkIcon width={16} />}
        aria-label="Close form"
      />

      <VStack align="start" spacing={4}>
        <VStack align="start" spacing={3} width="100%">
          <Field
            value={recipient}
            width="100%"
            maxWidth="600px"
            label="Recipient"
            size="sm"
            errorText={
              !isValidRecipient
                ? "Please enter a valid principal ID (e.g. rrkah-fqaaa-aaaaa-aaaaq-cai)"
                : undefined
            }
            invalid={!isValidRecipient}
          >
            <InputGroup
              startElement={<UserCircleIcon width={16} />}
              width="100%"
              maxWidth="600px"
            >
              <Input
                value={recipient}
                size="sm"
                variant="subtle"
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter recipient identifier"
              />
            </InputGroup>
          </Field>
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Amount (ICP)
            </Text>
          </Box>
          <InputGroup flex="1" startElement={<CurrencyDollarIcon width={16} />}>
            <Input
              value={amount}
              variant="subtle"
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="Enter amount in ICP"
              step="0.00000001"
              min="0"
            />
          </InputGroup>
        </VStack>

        <Box overflow="hidden" minHeight="20px">
          <Text fontSize="xs" color="gray.500">
            {deriveStepDisplayText()}
          </Text>
        </Box>

        <Button
          alignSelf="flex-start"
          colorScheme="blue"
          size="xs"
          leftIcon={<ClockIcon />}
          onClick={handleCreateTransaction}
          disabled={formStep !== "idle"}
          cursor={formStep === "idle" ? "pointer" : "default"}
        >
          Create
        </Button>
      </VStack>
    </Box>
  );
};

CreateTransaction.propTypes = {
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func,
};

export default CreateTransaction;
