import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    semanticTokens: {
      colors: {
        kg: {
          bad: {
            value: "{colors.red.50}",
          },
          good: {
            value: "{colors.green.50}",
          },
          neutral: {
            value: "{colors.gray.50}",
          },
        },
      },
    },
    tokens: {},
  },
});

export default system;
