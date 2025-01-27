import { HStack, Box, Flex, VStack, Text } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { useColorModeValue } from "@/components/ui/color-mode";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectApprovalsCount } from "@/state/decisions_slice";
import { selectCurrentVaultId } from "@/state/session_slice";
import { selectVaultThreshold } from "@/state/vaults_slice";
import { selectVaultSigners } from "../../state/signers_slice";
import { GlobalSettings } from "@/constants/global_config";
import { useEffect } from "react";

export function ApprovalGrid({ txId, ...props }) {
  const approvedBg = useColorModeValue("black", "white");
  const unapprovedBg = useColorModeValue("gray.100", "whiteAlpha.200");
  const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.300");
  const currentVaultId = useSelector((state) => selectCurrentVaultId(state));
  const approvals = useSelector((state) =>
    selectApprovalsCount(state, currentVaultId, txId)
  );
  const threshold = useSelector((state) =>
    selectVaultThreshold(state, currentVaultId)
  );
  const signers = useSelector((state) =>
    selectVaultSigners(state, currentVaultId)
  );

  const BOX_WIDTH = 16; // px
  const BOX_SPACING = 8.25; // px, equivalent to spacing={1} in HStack
  const adjustedThreshold = Math.min(threshold, signers.length);

  const elements = [];
  signers.forEach((signer, index) => {
    elements.push(
      <Tooltip key={signer.toString()} content={`${signer.name}'s Approval`}>
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
    );

    if (signers.length > 1) {
      const nextBlockPosition =
        (adjustedThreshold - 1) * (BOX_WIDTH + BOX_SPACING) -
        BOX_SPACING / 2 +
        6;

      const slightCorrectionTowardsCenter = 2;
      const thresholdPosition =
        nextBlockPosition - BOX_SPACING / 2 - slightCorrectionTowardsCenter;

      elements.push(
        <Flex
          key={`threshold-${crypto.randomUUID()}`}
          direction="column"
          align="center"
          position="absolute"
          style={{ left: `${thresholdPosition}px` }}
          bottom="-20px"
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
    <VStack
      align="flex-end"
      spacing={1}
      position="relative"
      {...props}
      mb="24px"
    >
      <Text
        visibility={GlobalSettings["dev_mode"].enabled ? "visible" : "hidden"}
      >
        {approvals}/{adjustedThreshold}
      </Text>
      <HStack spacing={1} position="relative">
        {elements}
      </HStack>
      {signers.length === 1 && (
        <Text fontSize="2xs" color={approvedBg} mt="1px">
          You are the only signer.
        </Text>
      )}
    </VStack>
  );
}

ApprovalGrid.propTypes = {
  txId: PropTypes.number.isRequired,
};

export default ApprovalGrid;
