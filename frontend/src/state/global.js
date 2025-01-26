import { configureStore } from "@reduxjs/toolkit";
import { transactionsReducer } from "@/state/transactions_reducers";
import { signersReducer } from "@/state/signers_slice";
import { vaultsReducer } from "@/state/vaults_slice";
import { configReducer } from "@/state/config_slice";
import { approvalsReducer } from "@/state/approvals_slice";
import { sessionReducer } from "@/state/session_slice";
import { usersReducer } from "@/state/users_slice";
const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    signers: signersReducer,
    vaults: vaultsReducer,
    approvals: approvalsReducer,
    config: configReducer,
    session: sessionReducer,
    users: usersReducer,
  },
});

export { store };
