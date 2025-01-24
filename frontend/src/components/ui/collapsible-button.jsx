import { Button, Box, Collapsible } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";

const CollapsibleButton = ({
  buttonText,
  icon,
  children,
  variant = "outline",
  colorScheme = "gray",
  activeVariant = "solid",
  activeColorScheme = "blue",
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Collapsible.Root open={isOpen}>
      <Box position="relative">
        <Collapsible.Trigger asChild>
          <Button
            width="fit-content"
            onClick={onOpen}
            mb={isOpen ? 2 : 0}
            variant={isOpen ? activeVariant : variant}
            colorScheme={isOpen ? activeColorScheme : colorScheme}
            leftIcon={icon}
          >
            {buttonText}
          </Button>
        </Collapsible.Trigger>

        <Collapsible.Content>
          {typeof children === "function" ? children({ onClose }) : children}
        </Collapsible.Content>
      </Box>
    </Collapsible.Root>
  );
};

export default CollapsibleButton;
