import { VStack, HStack, Text, Card, Heading } from "@chakra-ui/react";
import { GlobalSettings } from "@/constants/global_config";
import { Switch } from "@/components/ui/switch";
import Draggable from "react-draggable";
import { AdjustmentsVerticalIcon } from "@heroicons/react/24/solid";
import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFeatureEnabled } from "@/state/config_slice";

export default function DevModePanel() {
  const nodeRef = useRef(null);

  const dispatch = useDispatch();
  const config = useSelector((state) => state.config);

  const handleToggle = (feature) => {
    console.log("setting feature", feature, "to", !config[feature].enabled);
    dispatch(setFeatureEnabled({ feature, enabled: !config[feature].enabled }));
  };

  if (!GlobalSettings.dev_mode.enabled) return null;

  return (
    <Draggable handle=".drag-handle" nodeRef={nodeRef}>
      <Card.Root
        position="fixed"
        bottom="4"
        right="4"
        width="300px"
        boxShadow="lg"
        bg="white"
        _dark={{
          bg: "gray.800",
        }}
        zIndex={100000}
        ref={nodeRef}
      >
        <Card.Header pb={0} className="drag-handle" cursor="grab">
          <Heading size="xs" fontWeight="normal">
            <HStack>
              <AdjustmentsVerticalIcon width={16} height={16} />
              <Text>Developer Mode</Text>
            </HStack>
          </Heading>
        </Card.Header>
        <Card.Body>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs">Transactions</Text>
              <Switch
                checked={config.transactions.enabled}
                onChange={() => handleToggle("transactions")}
                size="sm"
              />
            </HStack>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs">Signers</Text>
              <Switch
                checked={config.signers.enabled}
                onChange={() => handleToggle("signers")}
                size="sm"
              />
            </HStack>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs">Vault</Text>
              <Switch
                checked={config.vault.enabled}
                onChange={() => handleToggle("vault")}
                size="sm"
              />
            </HStack>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs">Header</Text>
              <Switch
                checked={config.header.enabled}
                onChange={() => handleToggle("header")}
                size="sm"
              />
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Draggable>
  );
}
