import { configureStore } from "@reduxjs/toolkit";
import { transactionsReducer } from "@/state/transactions_reducers";
import { signersReducer } from "@/state/signers_reducers";
import { vaultReducer } from "@/state/vault_reducers";

const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    signers: signersReducer,
    vault: vaultReducer,
  },
});

export { store };
