import { HStack, VStack, Image, Link } from "@chakra-ui/react";
import { ColorModeButton, useColorMode } from "@/components/ui/color-mode";
import { Feature } from "@/components/ui/feature";
import { DemoModal } from "./demo-modal";
import { useState } from "react";

export default function Header() {
  const { colorMode } = useColorMode();
  const [open, setOpen] = useState(false);

  return (
    <VStack spacing={2} align="stretch">
      <HStack justify="space-between">
        <Image
          src={
            colorMode === "dark" ? "/keygate-logo-w.png" : "/keygate-logo.png"
          }
          alt="Keygate Logo"
          height={{ base: "24px", sm: "28px", lg: "32px" }}
        />
        <ColorModeButton />
      </HStack>
      <Feature name="demo">
        <Link
          fontSize="sm"
          color="gray.500"
          onClick={() => setOpen(true)}
          cursor="pointer"
        >
          Need help? Check out this demo!
        </Link>
        <DemoModal isOpen={open} onClose={() => setOpen(false)} />
      </Feature>
    </VStack>
  );
}
