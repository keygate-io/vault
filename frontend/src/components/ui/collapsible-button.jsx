import { Button, Box, Collapsible } from "@chakra-ui/react";
import { useState } from "react";

const CollapsibleButton = ({
  content,
  children,
  variant = "outline",
  colorScheme = "gray",
  activeVariant = "subtle",
  activeColorScheme = "blue",
  size = "md",
  m,
  mt,
  mb,
  ml,
  mr,
  mx,
  my,
  ...rest
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root open={open}>
      <Box 
        position="relative"
        m={m}
        mt={mt}
        mb={mb}
        ml={ml}
        mr={mr}
        mx={mx}
        my={my}
      >
        <Collapsible.Trigger asChild>
          <Button
            width="fit-content"
            onClick={() => setOpen(!open)}
            mb={open ? 2 : 0}
            variant={open ? activeVariant : variant}
            colorScheme={open ? activeColorScheme : colorScheme}
            size={size}
            alignItems="center"
            {...rest}
          >
            {typeof content === 'function' ? content({ isOpen: open }) : content}
          </Button>
        </Collapsible.Trigger>

        <Collapsible.Content>
          {typeof children === "function" ? children({ onClose: () => setOpen(false) }) : children}
        </Collapsible.Content>
      </Box>
    </Collapsible.Root>
  );
};

export default CollapsibleButton;
