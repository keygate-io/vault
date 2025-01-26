import * as React from "react";
import { Avatar as ChakraAvatar, Group } from "@chakra-ui/react";

export const AvatarGroup = React.forwardRef(function AvatarGroup(props, ref) {
  const { size, variant, borderless, ...rest } = props;
  return (
    <ChakraAvatar.PropsProvider value={{ size, variant, borderless }}>
      <Group gap="0" spaceX="3" ref={ref} alignItems="flex-start" {...rest} />
    </ChakraAvatar.PropsProvider>
  );
});
