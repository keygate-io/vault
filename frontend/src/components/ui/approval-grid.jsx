import { HStack, Box } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { useColorModeValue } from "@/components/ui/color-mode";

function ApprovalGrid({ signers, approvals }) {
  const approvedBg = useColorModeValue("black", "white");
  const unapprovedBg = useColorModeValue("gray.100", "whiteAlpha.200");
  const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.300");

  return (
    <HStack spacing={1}>
      {signers.map((signer, index) => (
        <Tooltip key={signer.id} content={`${signer.name}'s Approval`}>
          <Box
            w="16px"
            h="16px"
            borderRadius="4px"
            transition="all 0.2s"
            bg={index < approvals ? approvedBg : unapprovedBg}
            borderWidth={1}
            borderColor={borderColor}
          />
        </Tooltip>
      ))}
    </HStack>
  );
}

export default ApprovalGrid;
