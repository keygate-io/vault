import { VStack, HStack, Text, Card, Heading } from "@chakra-ui/react";
import { GlobalSettings } from "@/constants/global_config";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import Draggable from "react-draggable";
import { AdjustmentsVerticalIcon } from "@heroicons/react/24/solid";

export default function DevModePanel() {
  const [settings, setSettings] = useState({
    transactions: GlobalSettings.transactions.enabled,
    signers: GlobalSettings.signers.enabled,
    vault: GlobalSettings.vault.enabled,
    header: GlobalSettings.header.enabled,
  });

  const handleToggle = (feature) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [feature]: !prev[feature] };
      GlobalSettings[feature].enabled = newSettings[feature];
      console.log(GlobalSettings);
      return newSettings;
    });
  };

  if (!GlobalSettings.dev_mode.enabled) return null;

  return (
    <Draggable handle=".drag-handle">
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
      >
        <Card.Header pb={0} className="drag-handle" cursor="grab">
          <Heading size="xs" fontWeight="normal">
            <HStack>
              <AdjustmentsVerticalIcon width={16} height={16} />
              <Text>Dev Mode Controls</Text>
            </HStack>
          </Heading>
        </Card.Header>
        <Card.Body>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs">Transactions</Text>
              <Switch
                isChecked={settings.transactions}
                onChange={() => handleToggle("transactions")}
                size="sm"
              />
            </HStack>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs">Signers</Text>
              <Switch
                isChecked={settings.signers}
                onChange={() => handleToggle("signers")}
                size="sm"
              />
            </HStack>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs">Vault</Text>
              <Switch
                isChecked={settings.vault}
                onChange={() => handleToggle("vault")}
                size="sm"
              />
            </HStack>
            <HStack justify="space-between" align="center">
              <Text fontSize="xs">Header</Text>
              <Switch
                isChecked={settings.header}
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
