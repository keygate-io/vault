import { HStack, VStack, Text, Button, Box } from "@chakra-ui/react";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import AddressDisplay from "@/components/ui/address-display";
import ApprovalGrid from "@/components/ui/approval-grid";
import floatPrecision from "@/utils/floatPrecision";
import { useColorModeValue } from "@/components/ui/color-mode";

const TransactionsList = ({ transactions, signers }) => {
  const bgColor = useColorModeValue("gray.50", "whiteAlpha.100");
  
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
              <HStack justify="space-between">
                <Box
                  bg={bgColor}
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {floatPrecision(tx.amount)} ICP
                  </Text>
                </Box>
              </HStack>
            </VStack>

            <VStack align="flex-end">
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
              <ApprovalGrid mt={1} signers={signers} approvals={tx.approvals} />
            </VStack>
            
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default TransactionsList;
