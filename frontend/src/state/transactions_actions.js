import { getRepository } from "@/constants/module_config";

export const FETCH_TRANSACTIONS_REQUEST = "FETCH_TRANSACTIONS_REQUEST";
export const FETCH_TRANSACTIONS_SUCCESS = "FETCH_TRANSACTIONS_SUCCESS";
export const FETCH_TRANSACTIONS_FAILURE = "FETCH_TRANSACTIONS_FAILURE";

export const CREATE_TRANSACTION_REQUEST = "CREATE_TRANSACTION_REQUEST";
export const CREATE_TRANSACTION_SUCCESS = "CREATE_TRANSACTION_SUCCESS";
export const CREATE_TRANSACTION_FAILURE = "CREATE_TRANSACTION_FAILURE";

const fetchTransactionsRequest = () => ({
  type: FETCH_TRANSACTIONS_REQUEST,
});

const fetchTransactionsSuccess = (transactions) => ({
  type: FETCH_TRANSACTIONS_SUCCESS,
  payload: transactions,
});

const fetchTransactionsFailure = (error) => ({
  type: FETCH_TRANSACTIONS_FAILURE,
  payload: error,
});

export const fetchTransactions = () => {
  return async (dispatch) => {
    dispatch(fetchTransactionsRequest());
    try {
      const repository = getRepository("transactions");
      const transactions = await repository.getAll();
      dispatch(fetchTransactionsSuccess(transactions));
    } catch (error) {
      dispatch(fetchTransactionsFailure(error.message));
    }
  };
};

const createTransactionRequest = () => ({
  type: CREATE_TRANSACTION_REQUEST,
});

const createTransactionSuccess = (transaction) => ({
  type: CREATE_TRANSACTION_SUCCESS,
  payload: transaction,
});

const createTransactionFailure = (error) => ({
  type: CREATE_TRANSACTION_FAILURE,
  payload: error,
});

export const createTransaction = (transactionData) => {
  return async (dispatch) => {
    dispatch(createTransactionRequest());
    try {
      const repository = getRepository("transactions");
      const transaction = await repository.create(transactionData);
      dispatch(createTransactionSuccess(transaction));
    } catch (error) {
      dispatch(createTransactionFailure(error.message));
    }
  };
};
