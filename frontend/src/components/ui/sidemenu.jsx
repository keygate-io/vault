import { Box, Portal } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

export default function SideMenu({ children, isOpen = false, onClose }) {
  const bg = useColorModeValue("white", "black");
  const borderColor = useColorModeValue("transparent", "transparent");
  const overlayBg = useColorModeValue("blackAlpha.400", "blackAlpha.600");

  return (
    <Portal>
      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={overlayBg}
          onClick={onClose}
          zIndex={9000}
        />
      )}
      <Box
        position="fixed"
        left={isOpen ? 0 : "-400px"}
        top={0}
        height="100vh"
        width="30vh"
        bg={bg}
        borderRight="1px solid"
        borderColor={borderColor}
        zIndex={9999}
        transition="left 0.3s ease-in-out"
        boxShadow={isOpen ? "lg" : "none"}
        p={4}
      >
        {children}
      </Box>
    </Portal>
  );
}
