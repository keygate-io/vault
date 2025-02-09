import { VStack, Box, Text, SimpleGrid, Center, Icon, Separator, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectVaults, fetchVaults, createVault, selectIsCreatingVault } from "@/state/vaults_slice";
import { Feature } from "@/components/ui/feature";
import { FiBox, FiLock, FiShield, FiDatabase } from "react-icons/fi";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { BuildingLibraryIcon } from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Input, Button, ProgressCircle } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import CollapsibleButton from "@/components/ui/collapsible-button";

const icons = [FiBox, FiLock, FiShield, FiDatabase];

function getRandomIcon(seed) {
  // Use the vault ID as a seed to always get the same icon for the same vault
  const index = parseInt(seed, 16) % icons.length;
  return icons[index];
}

function VaultSelector() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticating = useSelector(
    (state) => state.session.isAuthenticating
  );
  const vaults = useSelector(selectVaults);
  const isLoading = useSelector((state) => state.vaults.loading);
  const isCreating = useSelector(selectIsCreatingVault);
  const hoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.200");
  const bg = useColorModeValue("white", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const iconBg = useColorModeValue("gray.50", "gray.700");
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const [vaultName, setVaultName] = useState("");

  useEffect(() => {
    dispatch(fetchVaults());
  }, [dispatch]);

  const handleCreateVault = async (onClose) => {
    if (!vaultName.trim()) return;

    try {
      const result = await dispatch(
        createVault({ name: vaultName.trim() })
      ).unwrap();
      setVaultName("");
      onClose();
    } catch (error) {
      console.error("Failed to create vault:", error);
    }
  };

  const renderSkeletons = () => {
    return Array(2)
      .fill(0)
      .map((_, index) => (
        <Box
          key={`skeleton-${index}`}
          bg={bg}
          borderRadius="xl"
          boxShadow="sm"
          p={6}
          height="200px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          border="1px"
          borderColor={borderColor}
        >
          <Skeleton w="60px" h="60px" borderRadius="lg" mb={4} />
          <Box width="100%" textAlign="center">
            <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
          </Box>
        </Box>
      ));
  };

  return (
    <VStack spacing={8} align="stretch">
      <Feature name="header">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          pb={2}
        >
          <HStack alignItems="center" spacing={0}>
            <BuildingLibraryIcon width={20} />
            <Text
              marginLeft={-1}
              paddingLeft={0}
              fontSize="lg"
              fontWeight="semibold"
            >
              Vaults
            </Text>
          </HStack>
          <Button
            variant="ghost"
            colorScheme="gray"
            size="sm"
            onClick={() => document.getElementById("vault-creator").click()}
          >
            <PlusIcon
              width={20}
              className="hover:scale-110 transition-transform"
            />
          </Button>
        </Box>
        <Separator />
        <Box position="relative">
          <Box position="absolute" width="1px" height="1px" overflow="hidden">
            <CollapsibleButton
              id="vault-creator"
              content={<Box display="none" />}
            >
              {({ onClose }) => (
                <>
                  <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="blackAlpha.600"
                    onClick={onClose}
                    zIndex={999}
                  />
                  <Box
                    position="fixed"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    zIndex={1000}
                    bg={bg}
                    borderRadius="xl"
                    boxShadow="xl"
                    width="90%"
                    maxWidth="400px"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box position="absolute" top={2} right={2}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClose}
                        p={1}
                        minW="auto"
                        height="auto"
                      >
                        <XMarkIcon width={16} />
                      </Button>
                    </Box>
                    <VStack spacing={3} p={4} align="stretch">
                      <Text
                        fontSize="sm"
                        align="center"
                        textAlign="center"
                        fontWeight="medium"
                        mb={2}
                      >
                        Create a new vault
                      </Text>
                      <Input
                        placeholder="Vault name"
                        size="sm"
                        variant="filled"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => handleCreateVault(onClose)}
                        isDisabled={!vaultName.trim() || isCreating}
                      >
                        {isCreating ? (
                          <ProgressCircle.Root value={75}>
                            <ProgressCircle.Circle>
                              <ProgressCircle.Track />
                              <ProgressCircle.Range />
                            </ProgressCircle.Circle>
                          </ProgressCircle.Root>
                        ) : (
                          "Create"
                        )}
                      </Button>
                    </VStack>
                  </Box>
                </>
              )}
            </CollapsibleButton>
          </Box>
        </Box>
      </Feature>
      <Feature name="vaults">
        <SimpleGrid
          columns={{ base: 2, md: 3, lg: 4 }}
          spacing={10}
          gap={10}
          mt={4}
        >
          {isAuthenticating || isLoading
            ? renderSkeletons()
            : Object.values(vaults).map((vault) => {
                const VaultIcon = getRandomIcon(vault.id);
                return (
                  <Box
                    key={vault.id}
                    onClick={() => navigate(`/vaults/${vault.id}`)}
                    cursor="pointer"
                    bg={bg}
                    borderRadius="xl"
                    boxShadow="sm"
                    p={6}
                    transition="all 0.5s"
                    _hover={{
                      bg: hoverBg,
                    }}
                    height="200px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    border="1px"
                    borderColor={borderColor}
                  >
                    <Center
                      bg={iconBg}
                      w="60px"
                      h="60px"
                      borderRadius="lg"
                      mb={4}
                    >
                      <Icon as={VaultIcon} w={6} h={6} color={iconColor} />
                    </Center>
                    <Text fontWeight="medium" fontSize="md" mb={2}>
                      {vault.name || `Vault ${vault.id}`}
                    </Text>
                  </Box>
                );
              })}
        </SimpleGrid>
      </Feature>
    </VStack>
  );
}

export default VaultSelector;
