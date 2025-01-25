import {
  FETCH_VAULT_REQUEST,
  FETCH_VAULT_SUCCESS,
  FETCH_VAULT_FAILURE,
} from "@/state/vault_actions";

const initialState = {
  vault_details: {
    balance: 0,
  },
  loading: false,
  error: null,
};

const vaultReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_VAULT_REQUEST:
      return { ...state, loading: true };
    case FETCH_VAULT_SUCCESS:
      return { ...state, vault_details: action.payload, loading: false };
    case FETCH_VAULT_FAILURE:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export { vaultReducer };
