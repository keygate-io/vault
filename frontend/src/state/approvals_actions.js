import { getRepository } from "@/constants/module_config";

export const APPROVE_TRANSACTION_REQUEST = "APPROVE_TRANSACTION_REQUEST";
export const APPROVE_TRANSACTION_SUCCESS = "APPROVE_TRANSACTION_SUCCESS";
export const APPROVE_TRANSACTION_FAILURE = "APPROVE_TRANSACTION_FAILURE";

export const approveTransactionRequest = (transactionId) => ({
  type: APPROVE_TRANSACTION_REQUEST,
  payload: transactionId,
});

export const approveTransactionSuccess = (transaction) => ({
  type: APPROVE_TRANSACTION_SUCCESS,
  payload: transaction,
});

export const approveTransactionFailure = (error) => ({
  type: APPROVE_TRANSACTION_FAILURE,
  payload: error,
});

export const approveTransaction = (transactionId) => {
  return async (dispatch) => {
    dispatch(approveTransactionRequest(transactionId));
    try {
      const RepositoryType = getRepository("transactions");
      const repository = new RepositoryType();
      const transaction = await repository.approve(transactionId);
      dispatch(approveTransactionSuccess(transaction));
    } catch (error) {
      dispatch(approveTransactionFailure(error.message));
    }
  };
};
