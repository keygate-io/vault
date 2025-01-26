import {
  APPROVE_TRANSACTION_REQUEST,
  APPROVE_TRANSACTION_SUCCESS,
  APPROVE_TRANSACTION_FAILURE,
} from "@/state/approvals_actions";

const initialState = {
  approvals_map: {},
  approveLoading: false,
  error: null,
};

const approvalsReducer = (state = initialState, action) => {
  switch (action.type) {
    case APPROVE_TRANSACTION_REQUEST:
      return {
        ...state,
        approveLoading: true,
        error: null,
      };
    case APPROVE_TRANSACTION_SUCCESS:
      return {
        ...state,
        approveLoading: false,
        error: null,
      };
    case APPROVE_TRANSACTION_FAILURE:
      return {
        ...state,
        approveLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export { approvalsReducer };
