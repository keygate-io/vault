import { configureStore } from "@reduxjs/toolkit";
import { transactionsReducer } from "@/state/transactions_reducers";
import { signersReducer } from "@/state/signers_reducers";

const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    signers: signersReducer,
  },
});

export { store };
