import { HStack, VStack, Text, Button, Box, Center } from "@chakra-ui/react";
import {
  CheckCircleIcon,
  ClockIcon,
  InboxIcon,
} from "@heroicons/react/24/solid";
import AddressDisplay from "@/components/ui/address-display";
import ApprovalGrid from "@/components/ui/approval-grid";
import floatPrecision from "@/utils/floatPrecision";
import { useColorModeValue } from "@/components/ui/color-mode";

const EmptyTransactions = () => {
  const textColor = useColorModeValue("gray.600", "gray.400");
  return (
    <Center w="full" py={12}>
      <VStack spacing={3}>
        <InboxIcon className="text-gray-400" width={32} />
        <Text fontSize="md" color={textColor}>
          No proposals emitted yet
        </Text>
      </VStack>
    </Center>
  );
};

const TransactionsList = ({ transactions, signers, threshold }) => {
  const bgColor = useColorModeValue("gray.50", "whiteAlpha.100");

  if (!transactions.length) {
    return <EmptyTransactions />;
  }

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
                <Box bg={bgColor} px={2} py={1} borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">
                    {floatPrecision(tx.amount)} ICP
                  </Text>
                </Box>
              </HStack>
            </VStack>

            <VStack align="flex-end">
              <Button
                variant={tx.approvals >= threshold ? "solid" : "outline"}
                colorScheme={tx.approvals >= threshold ? "green" : "blue"}
                disabled={tx.approvals >= threshold}
                size="sm"
                leftIcon={
                  tx.approvals >= threshold ? (
                    <CheckCircleIcon />
                  ) : (
                    <ClockIcon />
                  )
                }
              >
                {tx.approvals >= threshold ? "Executed" : "Approve"}
              </Button>
              <ApprovalGrid
                mt={1}
                signers={signers}
                approvals={tx.approvals}
                threshold={threshold}
              />
            </VStack>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default TransactionsList;
