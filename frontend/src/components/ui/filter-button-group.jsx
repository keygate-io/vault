import { Box, HStack, Button } from "@chakra-ui/react";

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

export default function FilterButtonGroup({
  filters,
  selectedFilters,
  onChange,
}) {
  const toggleFilter = (filter) => {
    onChange((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((f) => f !== filter);
      }
      return [...prev, filter];
    });
  };

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
            isSelected={selectedFilters.includes(filter.value)}
            onClick={() => toggleFilter(filter.value)}
          />
        ))}
      </HStack>
    </Box>
  );
}
