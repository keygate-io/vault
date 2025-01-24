import { HStack, Box, Flex } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { useColorModeValue } from "@/components/ui/color-mode";

export function ApprovalGrid({ signers, approvals, threshold, ...props }) {
  const approvedBg = useColorModeValue("black", "white");
  const unapprovedBg = useColorModeValue("gray.100", "whiteAlpha.200");
  const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.300");

  const BOX_WIDTH = 16; // px
  const BOX_SPACING = 4; // px, equivalent to spacing={1} in HStack
  const adjustedThreshold = Math.min(threshold, signers.length);

  const elements = [];
  signers.forEach((signer, index) => {
    elements.push(
      <Tooltip key={signer.id} content={`${signer.name}'s Approval`}>
        <Box
          w="16px"
          h="16px"
          borderRadius="4px"
          transition="all 0.2s"
          bg={index < approvals ? approvedBg : unapprovedBg}
          borderWidth={1}
          borderColor={borderColor}
          mr={
            index === signers.length - 1 && adjustedThreshold === signers.length
              ? "23px"
              : "0px"
          }
        />
      </Tooltip>
    );

    if (signers.length > 1) {
      const thresholdPosition =
        (adjustedThreshold - 1) * (BOX_WIDTH + BOX_SPACING) -
        BOX_SPACING / 2 +
        6;

      elements.push(
        <Flex
          key="threshold"
          direction="column"
          align="center"
          position="absolute"
          style={{ left: `${thresholdPosition}px` }}
          bottom="-20px"
          cursor="pointer"
        >
          <Box w="1px" h="23px" bg={approvedBg} />
          <Box fontSize="2xs" color={approvedBg} mt="1px">
            Threshold
          </Box>
        </Flex>
      );
    }
  });

  return (
    <HStack spacing={1} position="relative" {...props} mb="24px">
      {elements}
    </HStack>
  );
}

export default ApprovalGrid;
