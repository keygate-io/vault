import { configureStore } from "@reduxjs/toolkit";
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  FETCH_TRANSACTIONS_FAILURE,
} from "@/state/transactions_fetcher";
import {
  FETCH_SIGNERS_REQUEST,
  FETCH_SIGNERS_SUCCESS,
  FETCH_SIGNERS_FAILURE,
} from "@/state/signers_fetcher";

export const ADD_TRANSACTION = "ADD_TRANSACTION";

export const addTransaction = (transaction) => ({
  type: ADD_TRANSACTION,
  payload: transaction,
});

export const ADD_SIGNER = "ADD_SIGNER";

export const addSigner = (signer) => ({
  type: ADD_SIGNER,
  payload: signer,
});

const initialState = {
  transactions: [],
  signers: [],
  loading: false,
  error: null,
};

const transactionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TRANSACTIONS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        transactions: action.payload,
        loading: false,
      };
    case FETCH_TRANSACTIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case ADD_TRANSACTION:
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
    default:
      return state;
  }
};

const signersReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SIGNERS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_SIGNERS_SUCCESS:
      return {
        ...state,
        signers: action.payload,
        loading: false,
      };
    case FETCH_SIGNERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case ADD_SIGNER:
      return {
        ...state,
        signers: [...state.signers, action.payload],
      };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    signers: signersReducer,
  },
});

export { store };
