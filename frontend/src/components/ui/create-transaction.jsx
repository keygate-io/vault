import { Box, Button, VStack, Text, Input } from "@chakra-ui/react";
import {
  XMarkIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { InputGroup } from "@/components/ui/input-group";
import { useDispatch } from "react-redux";
import { createTransaction } from "@/state/transactions_slice";
import { Field } from "@/components/ui/field";
import { isValidPrincipal } from "@/utils/cryptoAddressFormats";
import { isValidAccountIdentifier } from "@/utils/cryptoAddressFormats";
import { floatToE8s } from "@/utils/floatPrecision";
import PropTypes from "prop-types";

const CreateTransaction = ({ onClose, vaultId, onError }) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [formStep, setFormStep] = useState("idle");
  const [isValidRecipient, setIsValidRecipient] = useState(true);

  const dispatch = useDispatch();

  const simulateSending = () => {
    setFormStep("sending");
    setTimeout(() => {
      scheduleFormCleanup();
      scheduleFormClose();
      setFormStep("sent");
    }, 2000);
  };

  const scheduleFormCleanup = () => {
    setTimeout(() => {
      setRecipient("");
      setAmount("");
      setFormStep("idle");
    }, 2000);
  };

  const scheduleFormClose = () => {
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const deriveStepDisplayText = () => {
    if (formStep === "sending") {
      return "Proposing transaction to decentralized vault...";
    }

    if (formStep === "sent") {
      return "Transaction proposed successfully.";
    }

    return "";
  };

  const handleCreateTransaction = async () => {
    const isValid =
      isValidPrincipal(recipient) || isValidAccountIdentifier(recipient);

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
                ? "Please enter a principal (e.g. rrkah-fqaaa-aaaaa-aaaaq-cai) or an account identifier (64 characters, hexadecimal)."
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
          <Text
            fontSize="xs"
            color="gray.500"
          >
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
  vaultId: PropTypes.string.isRequired,
  onError: PropTypes.func,
};

export default CreateTransaction;
