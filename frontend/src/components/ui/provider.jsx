"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";
import system from "./color-scheme";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/state/global";
import { IdentityKitProvider } from "@nfid/identitykit/react";
import "@nfid/identitykit/react/styles.css"


export function Provider(props) {
  return (
    <IdentityKitProvider
      authType={"DELEGATION"}
      signerClientOptions={{
        targets: [import.meta.env.VITE_CANISTER_ID_MANAGER],
      }}
    >
      <ReduxProvider store={store}>
        <ChakraProvider value={system}>
          <ColorModeProvider {...props}>{props.children}</ColorModeProvider>
        </ChakraProvider>
      </ReduxProvider>
    </IdentityKitProvider>
  );
}
