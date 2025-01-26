import { configureStore } from "@reduxjs/toolkit";
import { transactionsReducer } from "@/state/transactions_reducers";
import { signersReducer } from "@/state/signers_slice";
import { vaultsReducer } from "@/state/vaults_slice";
import { configReducer } from "@/state/config_slice";
import { decisionsReducer } from "@/state/decisions_slice";
import { sessionReducer } from "@/state/session_slice";
import { usersReducer } from "@/state/users_slice";
const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    signers: signersReducer,
    vaults: vaultsReducer,
    decisions: decisionsReducer,
    config: configReducer,
    session: sessionReducer,
    users: usersReducer,
  },
});

export { store };
