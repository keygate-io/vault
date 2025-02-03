import { VStack, Box, Text, SimpleGrid, Center, Icon, Separator, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectVaults, fetchVaults } from "@/state/vaults_slice";
import { Feature } from "@/components/ui/feature";
import { FiBox, FiLock, FiShield, FiDatabase } from "react-icons/fi";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { BuildingLibraryIcon } from "@heroicons/react/24/solid";

const icons = [FiBox, FiLock, FiShield, FiDatabase];

function getRandomIcon(seed) {
  // Use the vault ID as a seed to always get the same icon for the same vault
  const index = parseInt(seed, 16) % icons.length;
  return icons[index];
}

function VaultSelector() {
  const navigate = useNavigate();
  const isAuthenticating = useSelector((state) => state.session.isAuthenticating);
  const vaults = useSelector(selectVaults);
  const isLoading = useSelector((state) => state.vaults.loading);
  const hoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.200");
  const bg = useColorModeValue("white", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const iconBg = useColorModeValue("gray.50", "gray.700");
  const iconColor = useColorModeValue("gray.600", "gray.300");

  const renderSkeletons = () => {
    return Array(2).fill(0).map((_, index) => (
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
        <Skeleton
          w="60px"
          h="60px"
          borderRadius="lg"
          mb={4}
        />
        <Box width="100%" textAlign="center">
          <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
        </Box>
      </Box>
    ));
  };

  return (
    <VStack spacing={8} align="stretch">
      <Feature name="header">
        <Box display="flex" alignItems="center" justifyContent="space-between" pb={2}>
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
        </Box>
        <Separator />
      </Feature>
      <Feature name="vaults">
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={10} gap={10} mt={4}>
          {isAuthenticating || isLoading ? renderSkeletons() : Object.values(vaults).map((vault) => {
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
                  bg: hoverBg
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
