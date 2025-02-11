import { configureStore } from "@reduxjs/toolkit";
import { signersReducer } from "@/state/signers_slice";
import { vaultsReducer } from "@/state/vaults_slice";
import { configReducer } from "@/state/config_slice";
import { decisionsReducer } from "@/state/decisions_slice";
import { sessionReducer } from "@/state/session_slice";
import { usersReducer } from "@/state/users_slice";
import { transactionsReducer } from "@/state/transactions_slice";
import { invitationsReducer } from "@/state/invitations_slice";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
  transactions: transactionsReducer,
  signers: signersReducer,
  vaults: vaultsReducer,
  decisions: decisionsReducer,
  config: configReducer,
  session: sessionReducer,
  users: usersReducer,
  invitations: invitationsReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export { store };
