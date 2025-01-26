import * as React from "react";
import { Avatar as ChakraAvatar, Box } from "@chakra-ui/react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { AvatarFallback } from "./avatar-fallback";

export const AvatarWithUpload = ({
  src,
  srcSet,
  loading,
  name,
  icon,
  fallback,
  isEditing,
}) => (
  <Box position="relative">
    <ChakraAvatar.Root size="2xl" src={src} srcSet={srcSet} loading={loading}>
      <AvatarFallback name={name} icon={icon}>
        {fallback}
      </AvatarFallback>
      <ChakraAvatar.Image src={src} srcSet={srcSet} loading={loading} />
    </ChakraAvatar.Root>
    {isEditing && (
      <Box
        position="absolute"
        inset="0"
        bg="blackAlpha.600"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        transition="opacity 0.2s"
        _hover={{ bg: "blackAlpha.700" }}
      >
        <ArrowUpTrayIcon color="white" width={24} height={24} />
      </Box>
    )}
  </Box>
);
