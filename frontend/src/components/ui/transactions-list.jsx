import { HStack, VStack, Text, Button, Box } from "@chakra-ui/react";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import AddressDisplay from "@/components/ui/address-display";
import ApprovalGrid from "@/components/ui/approval-grid";

const TransactionsList = ({ transactions, signers }) => {
  return (
    <VStack spacing={3} align="stretch">
      {transactions.map((tx) => (
        <Box key={tx.id} p={4} borderWidth={1} borderRadius="md">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <AddressDisplay
                address={tx.recipient}
                type={
                  tx.recipient.startsWith("rrkah") ? "principal" : "account"
                }
              />
              <Text fontSize="sm" color="gray.500">
                {tx.amount}
              </Text>
              <ApprovalGrid signers={signers} approvals={tx.approvals} />
            </VStack>

            <Button
              variant={tx.approvals >= tx.required ? "solid" : "outline"}
              colorScheme={tx.approvals >= tx.required ? "green" : "blue"}
              disabled={tx.approvals >= tx.required}
              leftIcon={
                tx.approvals >= tx.required ? (
                  <CheckCircleIcon />
                ) : (
                  <ClockIcon />
                )
              }
            >
              {tx.approvals >= tx.required ? "Executed" : "Approve"}
            </Button>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default TransactionsList;
