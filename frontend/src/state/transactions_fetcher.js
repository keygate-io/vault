// actions/transactionActions.js
import { getRepository } from "@/constants/module_config";

export const FETCH_TRANSACTIONS_REQUEST = "FETCH_TRANSACTIONS_REQUEST";
export const FETCH_TRANSACTIONS_SUCCESS = "FETCH_TRANSACTIONS_SUCCESS";
export const FETCH_TRANSACTIONS_FAILURE = "FETCH_TRANSACTIONS_FAILURE";

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
      const RepositoryType = getRepository("transactions");
      const repository = new RepositoryType();
      const transactions = await repository.getAll();
      dispatch(fetchTransactionsSuccess(transactions));
    } catch (error) {
      dispatch(fetchTransactionsFailure(error.message));
    }
  };
};
