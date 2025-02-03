import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MultisigWallet from "./App.jsx";
import { Provider } from "@/components/ui/provider";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <MultisigWallet />
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
