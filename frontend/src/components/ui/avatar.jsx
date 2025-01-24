"use client";

import { Avatar as ChakraAvatar, Group, Box, VStack, Text, HStack, Button, IconButton, Input } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import * as React from "react";
import { PopoverRoot, PopoverTrigger, PopoverContent, PopoverArrow } from "./popover";
import { EllipsisVerticalIcon, ChevronRightIcon, PencilIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { MenuRoot, MenuItem, MenuContent, MenuTrigger } from "./menu";
import CollapsibleButton from "@/components/ui/collapsible-button";
import { InputGroup } from "@/components/ui/input-group";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const ViewMode = ({ name, onEdit }) => (
  <HStack spacing={3} justify="space-between">
    <Text fontWeight="medium" fontSize="md">{name}</Text>
    <Button
      variant="ghost"
      size="xs"
      colorScheme="gray"
      leftIcon={<PencilIcon className="w-3 h-3" />}
      onClick={onEdit}
    >
      Edit
    </Button>
  </HStack>
);

const EditingMode = ({ name, onChange, onConfirm }) => (
  <HStack spacing={3} justify="space-between">
    <Input
      value={name}
      onChange={(e) => onChange(e.target.value)}
      variant="subtle"
      size="sm"
      paddingLeft={4}
    />
    <Button
      variant="ghost"
      size="xs"
      colorScheme="gray"
      onClick={onConfirm}
    >
      Confirm
    </Button>
  </HStack>
);

const AvatarWithUpload = ({ src, srcSet, loading, name, icon, fallback, isEditing }) => (
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

const CurrentUserPopoverContent = ({ name, src, srcSet, loading, icon, fallback }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(name);

  const handleToggleEdit = () => {
    if (isEditing) {
      // Save the name here in a real app
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      <HStack spacing={3} justify="space-between">
        <HStack spacing={3}>
          <AvatarWithUpload
            src={src}
            srcSet={srcSet}
            loading={loading}
            name={isEditing ? editedName : name}
            icon={icon}
            fallback={fallback}
            isEditing={isEditing}
          />
          <VStack align="start" spacing={1}>
            {isEditing ? (
              <EditingMode
                name={editedName}
                onChange={setEditedName}
                onConfirm={handleToggleEdit}
              />
            ) : (
              <ViewMode
                name={name}
                onEdit={handleToggleEdit}
              />
            )}
            <Text fontSize="sm" color="gray.500">This is you.</Text>
          </VStack>
        </HStack>
      </HStack>
      <CollapsibleButton 
        content={({ isOpen }) => (
          <HStack spacing={2}>
            <ChevronRightIcon className="w-4 h-4" />
            <Text fontSize="sm">{isOpen ? "Hide risky actions" : "Show risky actions"}</Text>
          </HStack>
        )}
        variant="ghost" 
        size="xs"
        mt={2}
        colorScheme="gray"
      >
        <VStack align="stretch" spacing={2} pt={2}>
          <Button size="sm" variant="ghost" color="red.500">Step down</Button>
        </VStack>
      </CollapsibleButton>
    </VStack>
  );
};

const OtherUserPopoverContent = ({
  name,
  src,
  srcSet,
  loading,
  icon,
  fallback,
}) => (
  <VStack align="stretch" spacing={4}>
    <HStack spacing={3} justify="space-between">
      <HStack spacing={3}>
        <ChakraAvatar.Root
          size="2xl"
          src={src}
          srcSet={srcSet}
          loading={loading}
        >
          <AvatarFallback name={name} icon={icon}>
            {fallback}
          </AvatarFallback>
          <ChakraAvatar.Image src={src} srcSet={srcSet} loading={loading} />
        </ChakraAvatar.Root>
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium" fontSize="md">
            {name}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {name} has access to this wallet.
          </Text>
        </VStack>
      </HStack>
    </HStack>
    <CollapsibleButton
      content={({ isOpen }) => (
        <HStack spacing={2}>
          <ChevronRightIcon className="w-4 h-4" />
          <Text fontSize="sm">
            {isOpen ? "Hide risky actions" : "Show risky actions"}
          </Text>
        </HStack>
      )}
      variant="ghost"
      size="xs"
      mt={2}
      colorScheme="gray"
    >
      <VStack align="stretch" spacing={2} pt={2}>
        <Button size="sm" variant="ghost" color="red.500">
          Remove access
        </Button>
      </VStack>
    </CollapsibleButton>
  </VStack>
);

export const Avatar = React.forwardRef(function Avatar(props, ref) {
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
    ...rest
  } = props;

  const bgColor = useColorModeValue("black", "white");
  const textColor = useColorModeValue("white", "black");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");

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
    <PopoverRoot placement="bottom" offset={[0, 20]} >
      <PopoverTrigger>
        <Box
          position="relative"
          pb={isCurrentUser ? "5" : "0"}
          transition="transform 0.2s"
          _hover={isCurrentUser ? { transform: "scale(1.05)" } : undefined}
        >
          <ChakraAvatar.Root
            ref={ref}
            {...rest}
            cursor="pointer"
          >
            <AvatarFallback name={name} icon={icon}>
              {fallback}
            </AvatarFallback>
            <ChakraAvatar.Image src={src} srcSet={srcSet} loading={loading} />
            {children}
          </ChakraAvatar.Root>
          {isCurrentUser && (
            <Box
              position="absolute"
              bottom="0"
              left="50%"
              transform="translateX(-50%)"
              bg={bgColor}
              color={textColor}
              fontSize="xs"
              px="2"
              py="0"
              borderRadius="full"
              border="1px solid"
              whiteSpace="nowrap"
              cursor="pointer"
            >
              You
            </Box>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent minW="300px" zIndex={10000}>
        <PopoverArrow />
        <Box p="4">
          {popoverContent || defaultPopoverContent}
        </Box>
      </PopoverContent>
    </PopoverRoot>
  );
});

const AvatarFallback = React.forwardRef(function AvatarFallback(props, ref) {
  const { name, icon, children, ...rest } = props;
  return (
    <ChakraAvatar.Fallback ref={ref} {...rest}>
      {children}
      {name != null && children == null && <>{getInitials(name)}</>}
      {name == null && children == null && (
        <ChakraAvatar.Icon asChild={!!icon}>{icon}</ChakraAvatar.Icon>
      )}
    </ChakraAvatar.Fallback>
  );
});

function getInitials(name) {
  const names = name.trim().split(" ");
  const firstName = names[0] != null ? names[0] : "";
  const lastName = names.length > 1 ? names[names.length - 1] : "";
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName.charAt(0);
}

export const AvatarGroup = React.forwardRef(function AvatarGroup(props, ref) {
  const { size, variant, borderless, ...rest } = props;
  return (
    <ChakraAvatar.PropsProvider value={{ size, variant, borderless }}>
      <Group gap="0" spaceX="3" ref={ref} alignItems="flex-start" {...rest} />
    </ChakraAvatar.PropsProvider>
  );
});
