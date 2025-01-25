import { Field as ChakraField } from "@chakra-ui/react";
import * as React from "react";
import { HStack } from "@chakra-ui/react";

export const Field = React.forwardRef(function Field(props, ref) {
  const {
    label,
    children,
    helperText,
    errorText,
    optionalText,
    leftIcon,
    ...rest
  } = props;
  return (
    <ChakraField.Root ref={ref} {...rest}>
      {label && (
        <ChakraField.Label color="gray.600">
          <HStack
            align="flex-start"
            display="flex"
            alignItems="flex-middle"
            verticalAlign="bottom"
          >
            {label}
            {leftIcon}
          </HStack>
          <ChakraField.RequiredIndicator fallback={optionalText} />
        </ChakraField.Label>
      )}
      {children}
      {helperText && (
        <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
      )}
      {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
    </ChakraField.Root>
  );
});
