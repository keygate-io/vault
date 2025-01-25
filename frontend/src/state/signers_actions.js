// actions/transactionActions.js
import { getRepository } from "@/constants/module_config";

export const FETCH_SIGNERS_REQUEST = "FETCH_SIGNERS_REQUEST";
export const FETCH_SIGNERS_SUCCESS = "FETCH_SIGNERS_SUCCESS";
export const FETCH_SIGNERS_FAILURE = "FETCH_SIGNERS_FAILURE";

const fetchSignersRequest = () => ({
  type: FETCH_SIGNERS_REQUEST,
});

const fetchSignersSuccess = (signers) => ({
  type: FETCH_SIGNERS_SUCCESS,
  payload: signers,
});

const fetchSignersFailure = (error) => ({
  type: FETCH_SIGNERS_FAILURE,
  payload: error,
});

const fetchSigners = () => {
  return async (dispatch) => {
    dispatch(fetchSignersRequest());
    try {
      const RepositoryType = getRepository("signers");
      const repository = new RepositoryType();
      const signers = await repository.getAll();
      dispatch(fetchSignersSuccess(signers));
    } catch (error) {
      dispatch(fetchSignersFailure(error.message));
    }
  };
};

export { fetchSigners };
