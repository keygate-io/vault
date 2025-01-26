import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  FETCH_TRANSACTIONS_FAILURE,
  CREATE_TRANSACTION_REQUEST,
  CREATE_TRANSACTION_SUCCESS,
  CREATE_TRANSACTION_FAILURE,
} from "@/state/transactions_actions";

const initialState = {
  transactions_list: [],
  fetchLoading: false,
  createLoading: false,
  error: null,
};

const transactionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TRANSACTIONS_REQUEST:
      return {
        ...state,
        fetchLoading: true,
      };
    case FETCH_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        transactions_list: action.payload,
        fetchLoading: false,
      };
    case FETCH_TRANSACTIONS_FAILURE:
      return {
        ...state,
        fetchLoading: false,
        error: action.payload,
      };
    case CREATE_TRANSACTION_REQUEST:
      return {
        ...state,
        createLoading: true,
        error: null,
      };
    case CREATE_TRANSACTION_SUCCESS:
      return {
        ...state,
        transactions_list: [...state.transactions_list, action.payload],
        createLoading: false,
        error: null,
      };
    case CREATE_TRANSACTION_FAILURE:
      return {
        ...state,
        createLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export { transactionsReducer };
