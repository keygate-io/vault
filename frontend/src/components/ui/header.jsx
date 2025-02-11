import {
  HStack,
  VStack,
  Image,
  Link,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { ColorModeButton, useColorMode } from "@/components/ui/color-mode";
import { Feature } from "@/components/ui/feature";
import { DemoModal } from "./demo-modal";
import { useState } from "react";
import {
  ArrowTopRightOnSquareIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { PopupButton } from "@typeform/embed-react";
import { useIdentity } from "@nfid/identitykit/react";
import { useDispatch } from "react-redux";
import { logout } from "@/state/session_slice";

export default function Header() {
  const { colorMode } = useColorMode();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const identity = useIdentity();
  const principal = identity?.getPrincipal()?.toString();

  const handleLogout = () => {
    dispatch(logout());
  };

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
        <HStack spacing={2}>
          {/* <IconButton
            variant="ghost"
            size="sm"
            aria-label="Logout"
            onClick={handleLogout}
          >
            <ArrowRightOnRectangleIcon width={20} height={20} />
          </IconButton> */}
          <ColorModeButton />
        </HStack>
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
