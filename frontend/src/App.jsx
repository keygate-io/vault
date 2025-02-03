import { Routes, Route } from "react-router-dom";
import { AuthLayout } from "@/view/AuthLayout";
import VaultSelector from "@/view/VaultSelector";
import Vault from "@/view/Vault";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/vaults/:vaultId" element={<Vault />} />
        <Route path="/" element={<VaultSelector />} />
        <Route path="/vaults" element={<VaultSelector />} />
      </Route>
    </Routes>
  );
}

export default App;
