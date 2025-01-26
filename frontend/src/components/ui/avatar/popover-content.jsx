import * as React from "react";
import { VStack, Text, HStack, Button, Input } from "@chakra-ui/react";
import { ChevronRightIcon, PencilIcon } from "@heroicons/react/24/outline";
import CollapsibleButton from "@/components/ui/collapsible-button";
import PropTypes from "prop-types";
import { AvatarWithUpload } from "./avatar-with-upload";

const ViewMode = ({ name, onEdit }) => (
  <HStack spacing={3} justify="space-between">
    <Text fontWeight="medium" fontSize="md">
      {name}
    </Text>
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
    <Button variant="ghost" size="xs" colorScheme="gray" onClick={onConfirm}>
      Confirm
    </Button>
  </HStack>
);

export const CurrentUserPopoverContent = ({
  name,
  src,
  srcSet,
  loading,
  icon,
  fallback,
}) => {
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
              <ViewMode name={name} onEdit={handleToggleEdit} />
            )}
            <Text fontSize="sm" color="gray.500">
              This is you.
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
            Step down
          </Button>
        </VStack>
      </CollapsibleButton>
    </VStack>
  );
};

CurrentUserPopoverContent.propTypes = {
  name: PropTypes.string.isRequired,
  src: PropTypes.string,
  srcSet: PropTypes.string,
  loading: PropTypes.string,
  icon: PropTypes.node,
  fallback: PropTypes.node,
};

export const OtherUserPopoverContent = ({
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
        <AvatarWithUpload
          src={src}
          srcSet={srcSet}
          loading={loading}
          name={name}
          icon={icon}
          fallback={fallback}
          isEditing={false}
        />
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
