import {
  HStack,
  Spinner,
  Icon,
  FormatNumber,
  Stat,
  createListCollection,
  Box,
  Text,
} from "@chakra-ui/react";
import {
  ExclamationTriangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { selectVaultBalance, selectVaultById } from "@/state/vaults_slice";
import { selectCurrentVaultId } from "@/state/session_slice";
import { Alert } from "@/components/ui/alert";
import { InfoTip } from "@/components/ui/toggle-tip";
import {
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useState } from "react";

export default function BalanceDisplay({ isLoading = false, error = null }) {
  const currentVaultId = useSelector((state) => selectCurrentVaultId(state));
  const vault = useSelector((state) => selectVaultById(state, currentVaultId));
  const balance = useSelector((state) =>
    selectVaultBalance(state, currentVaultId)
  );
  const balanceLoading = useSelector((state) => state.vaults.balance_loading);

  // Set USD as the default selected currency
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Create asset collection for the select dropdown
  const assetCollection = createListCollection({
    items: [
      { label: "USD", value: "USD" },
      { label: "ICP", value: "ICP" },
      { label: "BTC", value: "BTC" },
    ],
  });

  // Mock balances for UI display only
  const mockBalances = {
    USD: 935.4,
    ICP: 22.5,
    BTC: 0.015,
  };

  // Badge background color
  const badgeBgColor = useColorModeValue("gray.50", "whiteAlpha.100");
  const badgeTextColor = useColorModeValue("black", "white");

  if (!vault || balanceLoading) {
    return (
      <HStack spacing={2}>
        <Spinner size="lg" />
      </HStack>
    );
  }

  if (!vault) {
    return (
      <Alert
        status="error"
        title="Vault not found"
        icon={
          <Icon as={ExclamationTriangleIcon} className="h-5 w-5 text-red-500" />
        }
      />
    );
  }

  if (error) {
    return (
      <Alert
        status="error"
        title={`Failed to load balance: ${error}`}
        icon={
          <Icon as={ExclamationTriangleIcon} className="h-5 w-5 text-red-500" />
        }
      />
    );
  }

  // Render the balance display based on the selected currency
  const renderBalanceValue = () => {
    if (selectedCurrency === "BTC") {
      return (
        <Text fontSize="2xl" fontWeight="semibold">
          {balance} BTC
        </Text>
      );
    }

    return (
      <FormatNumber
        value={balance}
        style="currency"
        currency={selectedCurrency}
      />
    );
  };

  return (
    <HStack spacing={2} width="100%">
      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <Stat.Root>
          <Stat.Label>
            Balance
            <InfoTip>
              You can select which asset you want to display in the settings.
            </InfoTip>
          </Stat.Label>
          <HStack
            spacing={1}
            alignItems="center"
            fontSize="2xl"
            fontWeight="semibold"
          >
            {renderBalanceValue()}
            <PopoverRoot size="xs">
              <PopoverTrigger asChild>
                <Icon
                  as={Cog6ToothIcon}
                  height={5}
                  width={5}
                  cursor="pointer"
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>Asset</PopoverHeader>
                <PopoverBody>
                  <SelectRoot
                    collection={assetCollection}
                    size="sm"
                    defaultValue={["USD"]}
                    value={[selectedCurrency]}
                    onValueChange={(details) =>
                      setSelectedCurrency(details.value[0])
                    }
                    positioning={{ sameWidth: true, placement: "bottom" }}
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent portalled={false} width="full">
                      {assetCollection.items.map((asset) => (
                        <SelectItem key={asset.value} item={asset}>
                          <HStack width="100%" justify="space-between">
                            <Text>{asset.label}</Text>
                            <Box
                              bg={badgeBgColor}
                              px={2}
                              py={1}
                              borderRadius="md"
                              color={badgeTextColor}
                            >
                              <Text fontSize="xs" fontWeight="medium">
                                {asset.value === "BTC"
                                  ? mockBalances[asset.value]
                                  : new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: asset.value,
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }).format(mockBalances[asset.value])}
                              </Text>
                            </Box>
                          </HStack>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </PopoverBody>
              </PopoverContent>
            </PopoverRoot>
          </HStack>
        </Stat.Root>
      )}
    </HStack>
  );
}
