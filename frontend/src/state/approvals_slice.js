import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";
import { createSelector } from "reselect";

// Async thunk for approving a transaction
export const approveTransaction = createAsyncThunk(
  "approvals/approveTransaction",
  async (transactionId, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("transactions");
      const repository = new RepositoryType();
      const approvals = await repository.approve(transactionId);
      return {
        txId: transactionId,
        approvals,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  approvals_map: {},
  approveLoading: false,
  error: null,
};

// Create a slice
export const approvalsSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    // You can add other synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(approveTransaction.pending, (state) => {
        state.approveLoading = true;
        state.error = null;
      })
      .addCase(approveTransaction.fulfilled, (state, action) => {
        state.approveLoading = false;
        state.error = null;
        state.approvals_map = action.payload.approvals;
      })
      .addCase(approveTransaction.rejected, (state, action) => {
        state.approveLoading = false;
        state.error = action.payload;
      });
  },
});

// Derived state
const selectApprovalsState = (state) => state.approvals;

export const selectApprovalsCount = createSelector(
  [selectApprovalsState, (_, txId) => txId],
  (approvalsState, txId) => {
    const decisions = approvalsState.approvals_map[txId] || [];
    return decisions.length;
  }
);

export const getApprovalsForTxId = createSelector(
  [selectApprovalsState, (_, transactionId) => transactionId],
  (approvalsState, transactionId) => {
    const decisions = approvalsState.approvals_map[transactionId] || [];
    const approvals = decisions.filter((decision) => decision[1] === true);
    return approvals.length;
  }
);

export const hasUserApprovedThisTxId = createSelector(
  [selectApprovalsState, (_, txId) => txId, (_, __, userId) => userId],
  (approvalsState, txId, userId) => {
    if (!userId) return false;

    const decisions = approvalsState.approvals_map[txId] || [];
    const userDecision = decisions.find((decision) => decision[0] === userId);
    return userDecision ? userDecision[1] : false;
  }
);

export const { reducer: approvalsReducer } = approvalsSlice;
