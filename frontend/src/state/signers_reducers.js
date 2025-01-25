import {
  FETCH_SIGNERS_REQUEST,
  FETCH_SIGNERS_SUCCESS,
  FETCH_SIGNERS_FAILURE,
} from "@/state/signers_actions";

const initialState = {
  signers: [],
  loading: false,
  error: null,
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
    default:
      return state;
  }
};

export { signersReducer };
