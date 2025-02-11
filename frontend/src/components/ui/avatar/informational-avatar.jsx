import * as React from "react";
import { Box } from "@chakra-ui/react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "../popover";
import { Avatar } from "./avatar";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  CurrentUserPopoverContent,
  OtherUserPopoverContent,
} from "./popover-content";

export const InformationalAvatar = React.forwardRef(
  function InformationalAvatar(props, ref) {
    const {
      name,
      src,
      srcSet,
      loading,
      icon,
      fallback,
      children,
      isCurrentUser,
      popoverContent,
      isPending,
      ...rest
    } = props;

    const bgColor = useColorModeValue("black", "white");
    const textColor = useColorModeValue("white", "black");

    const defaultPopoverContent = isCurrentUser ? (
      <CurrentUserPopoverContent
        name={name}
        src={src}
        srcSet={srcSet}
        loading={loading}
        icon={icon}
        fallback={fallback}
      />
    ) : (
      <OtherUserPopoverContent
        name={name}
        src={src}
        srcSet={srcSet}
        loading={loading}
        icon={icon}
        fallback={fallback}
      />
    );

    return (
      <PopoverRoot placement="bottom" offset={[0, 20]}>
        <PopoverTrigger>
          <Box cursor="pointer">
            <Avatar
              ref={ref}
              name={name}
              src={src}
              srcSet={srcSet}
              loading={loading}
              icon={icon}
              fallback={fallback}
              label={isCurrentUser ? `You` : undefined}
              labelProps={{
                bg: bgColor,
                color: textColor,
              }}
              containerProps={{
                pb: isCurrentUser ? "5" : "0",
                transition: "transform 0.2s",
                _hover: isCurrentUser
                  ? { transform: "scale(1.05)" }
                  : undefined,
              }}
              {...rest}
            >
              {children}
            </Avatar>
          </Box>
        </PopoverTrigger>
        <PopoverContent minW="300px" zIndex={10000}>
          <PopoverArrow />
          <Box p="4">{popoverContent || defaultPopoverContent}</Box>
        </PopoverContent>
      </PopoverRoot>
    );
  }
);
