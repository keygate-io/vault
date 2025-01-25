import { Box, HStack, Button } from "@chakra-ui/react";
import PropTypes from "prop-types";

function FilterButton({ label, isSelected, onClick }) {
  return (
    <Button
      size="xs"
      borderRadius="full"
      bg={isSelected ? "white" : "transparent"}
      color={isSelected ? "gray.900" : "gray.600"}
      _dark={{
        bg: isSelected ? "gray.700" : "transparent",
        color: isSelected ? "white" : "gray.400",
      }}
      boxShadow={isSelected ? "xs" : "none"}
      _hover={{
        bg: isSelected ? "white" : "blackAlpha.50",
        _dark: {
          bg: isSelected ? "gray.700" : "whiteAlpha.50",
        },
      }}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

FilterButton.propTypes = {
  label: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function FilterButtonGroup({
  filters,
  selectedFilters,
  onChange,
}) {
  function notifyToggle(filter) {
    if (selectedFilters.includes(filter)) {
      onChange(selectedFilters.filter((f) => f !== filter));
    } else {
      onChange([...selectedFilters, filter]);
    }
  }

  return (
    <Box
      display="inline-flex"
      bg="gray.100"
      _dark={{ bg: "gray.800" }}
      borderRadius="full"
      p="1"
    >
      <HStack spacing={1}>
        {filters.map((filter) => (
          <FilterButton
            key={filter.value}
            label={filter.label}
            isSelected={selectedFilters.includes(filter)}
            onClick={() => notifyToggle(filter)}
          />
        ))}
      </HStack>
    </Box>
  );
}

FilterButtonGroup.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedFilters: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
};
