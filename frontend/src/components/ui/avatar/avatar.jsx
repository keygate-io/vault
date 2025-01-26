import * as React from "react";
import { Avatar as ChakraAvatar, Box } from "@chakra-ui/react";
import { AvatarFallback } from "./avatar-fallback";

export const Avatar = React.forwardRef(function Avatar(props, ref) {
  const {
    name,
    src,
    srcSet,
    loading,
    icon,
    fallback,
    children,
    label,
    avatarBorder,
    labelProps = {},
    containerProps = {},
    ...rest
  } = props;

  return (
    <Box position="relative" {...containerProps}>
      <ChakraAvatar.Root ref={ref} {...rest} border={avatarBorder}>
        <AvatarFallback name={name} icon={icon}>
          {fallback}
        </AvatarFallback>
        <ChakraAvatar.Image src={src} srcSet={srcSet} loading={loading} />
        {children}
      </ChakraAvatar.Root>
      {label && (
        <Box
          position="absolute"
          bottom="0"
          left="50%"
          transform="translateX(-50%)"
          fontSize="xs"
          px="2"
          py="0"
          borderRadius="full"
          border="1px solid"
          whiteSpace="nowrap"
          {...labelProps}
        >
          {label}
        </Box>
      )}
    </Box>
  );
});
