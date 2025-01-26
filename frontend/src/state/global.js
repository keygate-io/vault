import { configureStore } from "@reduxjs/toolkit";
import { transactionsReducer } from "@/state/transactions_reducers";
import { signersReducer } from "@/state/signers_reducers";
import { vaultReducer } from "@/state/vault_reducers";
import { configReducer } from "@/state/config_slice";
import { approvalsReducer } from "@/state/approvals_slice";
const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    signers: signersReducer,
    vault: vaultReducer,
    approvals: approvalsReducer,
    config: configReducer,
  },
});

export { store };
