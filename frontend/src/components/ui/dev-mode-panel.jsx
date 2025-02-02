import { VStack, HStack, Text, Card, Heading, Box } from "@chakra-ui/react";
import { GlobalSettings } from "@/constants/global_config";
import { Switch } from "@/components/ui/switch";
import Draggable from "react-draggable";
import { AdjustmentsVerticalIcon } from "@heroicons/react/24/solid";
import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFeatureEnabled } from "@/state/config_slice";
import { AvatarGroup } from "@/components/ui/avatar/avatar-group";
import { Avatar } from "@/components/ui/avatar/avatar";
import { selectCurrentUserId } from "@/state/session_slice";
// import { fetchSession } from "@/state/session_slice";
import { getRepository } from "@/constants/module_config";

// Mock sessions for development
export default function DevModePanel() {
  const nodeRef = useRef(null);

  const dispatch = useDispatch();
  const config = useSelector((state) => state.config);

  const handleToggle = (feature) => {
    dispatch(setFeatureEnabled({ feature, enabled: !config[feature].enabled }));
  };

  const users = useSelector((state) => state.users.users_list);
  const currentUserId = useSelector((state) => selectCurrentUserId(state));

  const handleUserClick = (userId) => {
    // Selected user objects (contains all information)
    const selectedUser = users.find((u) => u.id === userId);
    if (!selectedUser) return;

    const sessionRepo = getRepository("session");
    sessionRepo.user = selectedUser;

    // dispatch(fetchSession());
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
              <Text>Playground Mode</Text>
            </HStack>
          </Heading>
        </Card.Header>
        <Card.Body>
          <VStack align="stretch" spacing={4}>
            {/* Session Switcher */}
            <Box>
              <Text fontSize="xs" mb={2} fontWeight="medium">
                Session Switcher
              </Text>
              <Box
                p={2}
                borderWidth={1}
                borderRadius="md"
                overflowX="auto"
                css={{
                  "&::-webkit-scrollbar": {
                    height: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#CBD5E0",
                    borderRadius: "3px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "#A0AEC0",
                  },
                }}
              >
                <Box minWidth="min-content">
                  <AvatarGroup>
                    {users.map((user) => (
                      <Box key={user.id} position="relative">
                        <Avatar
                          size="xs"
                          name={user.name}
                          src={user.avatarUrl}
                          containerProps={{
                            transition: "transform 0.2s",
                            _hover: {
                              cursor: "pointer",
                              transform: "scale(1.05)",
                            },
                          }}
                          onClick={() => handleUserClick(user.id)}
                        />
                        {user.id === currentUserId && (
                          <Box
                            position="absolute"
                            top="-1px"
                            left="-1px"
                            width="12px"
                            height="12px"
                            borderRadius="full"
                            bg="green.400"
                            border="2px solid white"
                            _dark={{
                              borderColor: "gray.800",
                            }}
                          />
                        )}
                      </Box>
                    ))}
                  </AvatarGroup>
                </Box>
              </Box>
            </Box>

            {/* Feature Toggles */}
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
                  checked={config.vaults.enabled}
                  onChange={() => handleToggle("vaults")}
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
          </VStack>
        </Card.Body>
      </Card.Root>
    </Draggable>
  );
}
