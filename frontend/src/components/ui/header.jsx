import { HStack, VStack, Image, Link, Text } from "@chakra-ui/react";
import { ColorModeButton, useColorMode } from "@/components/ui/color-mode";
import { Feature } from "@/components/ui/feature";
import { DemoModal } from "./demo-modal";
import { useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { PopupButton } from "@typeform/embed-react";
import { useIdentity } from "@nfid/identitykit/react";

export default function Header() {
  const { colorMode } = useColorMode();
  const [open, setOpen] = useState(false);

  const identity = useIdentity();
  const principal = identity?.getPrincipal()?.toString();

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
      {principal && (
        <Text fontSize="sm" color="gray.500">
          Principal: {principal}
        </Text>
      )}
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
      <Feature name="pilot_program_invitation">
        <PopupButton
          id="bBhbKWsG"
          style={{ fontSize: 20 }}
          className="my-button"
          enableSandbox={true}
        >
          <Link fontSize="sm" color="gray.500" target="_blank" cursor="pointer">
            Join our pilot program.{" "}
            <ArrowTopRightOnSquareIcon width={12} height={12} />
          </Link>
        </PopupButton>
      </Feature>
    </VStack>
  );
}
