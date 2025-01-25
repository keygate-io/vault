"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";
import system from "./color-scheme";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/state/global";

export function Provider(props) {
  return (
    <ReduxProvider store={store}>
      <ChakraProvider value={system}>
        <ColorModeProvider {...props}>{props.children}</ColorModeProvider>
      </ChakraProvider>
    </ReduxProvider>
  );
}
