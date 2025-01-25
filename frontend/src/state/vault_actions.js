import { getRepository } from "@/constants/module_config";

const FETCH_VAULT_REQUEST = "FETCH_VAULT_REQUEST";
const FETCH_VAULT_SUCCESS = "FETCH_VAULT_SUCCESS";
const FETCH_VAULT_FAILURE = "FETCH_VAULT_FAILURE";

const fetchVaultRequest = () => ({
  type: FETCH_VAULT_REQUEST,
});

const fetchVaultSuccess = (vault) => ({
  type: FETCH_VAULT_SUCCESS,
  payload: vault,
});

const fetchVaultFailure = (error) => ({
  type: FETCH_VAULT_FAILURE,
  payload: error,
});

export const fetchVault = () => {
  return async (dispatch) => {
    dispatch(fetchVaultRequest());
    try {
      const RepositoryType = getRepository("vault");
      const repository = new RepositoryType();
      const vault = await repository.get();
      dispatch(fetchVaultSuccess(vault));
    } catch (error) {
      dispatch(fetchVaultFailure(error.message));
    }
  };
};

export {
  FETCH_VAULT_REQUEST,
  FETCH_VAULT_SUCCESS,
  FETCH_VAULT_FAILURE,
  fetchVaultRequest,
  fetchVaultSuccess,
  fetchVaultFailure,
};
