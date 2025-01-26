import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";
import { createSelector } from "reselect";

// Async thunk for recording a decision
export const recordDecision = createAsyncThunk(
  "decisions/recordDecision",
  async ({ transactionId, isApproval }, { rejectWithValue }) => {
    try {
      const repository = getRepository("decisions");
      const decisions = await repository.recordDecision(
        transactionId,
        isApproval
      );
      return {
        txId: transactionId,
        decisions,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  decisions_map: {},
  decisionsLoading: false,
  error: null,
};

// Create a slice
export const decisionsSlice = createSlice({
  name: "decisions",
  initialState,
  reducers: {
    // You can add other synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(recordDecision.pending, (state) => {
        state.decisionsLoading = true;
        state.error = null;
      })
      .addCase(recordDecision.fulfilled, (state, action) => {
        state.decisionsLoading = false;
        state.error = null;
        state.decisions_map = action.payload.decisions;
      })
      .addCase(recordDecision.rejected, (state, action) => {
        console.warn("Could not record decision", action.payload);
        state.decisionsLoading = false;
        state.error = action.payload;
      });
  },
});

// Derived state
const selectDecisionsState = (state) => state.decisions;

export const selectDecisionsCount = createSelector(
  [selectDecisionsState, (_, txId) => txId],
  (decisionsState, txId) => {
    const decisions = decisionsState.decisions_map[txId] || [];
    return decisions.length;
  }
);

export const selectApprovalsCount = createSelector(
  [selectDecisionsState, (_, txId) => txId],
  (decisionsState, txId) => {
    const decisions = decisionsState.decisions_map[txId] || [];
    return decisions.filter((decision) => decision[1] === true).length;
  }
);

export const selectRejectionsCount = createSelector(
  [selectDecisionsState, (_, txId) => txId],
  (decisionsState, txId) => {
    const decisions = decisionsState.decisions_map[txId] || [];
    return decisions.filter((decision) => decision[1] === false).length;
  }
);

export const getApprovalsForTxId = createSelector(
  [selectDecisionsState, (_, transactionId) => transactionId],
  (decisionsState, transactionId) => {
    const decisions = decisionsState.decisions_map[transactionId] || [];
    const approvals = decisions.filter((decision) => decision[1] === true);
    return approvals.length;
  }
);

export const hasUserApprovedThisTxId = createSelector(
  [selectDecisionsState, (_, txId) => txId, (_, __, userId) => userId],
  (decisionsState, txId, userId) => {
    console.log("Debug hasUserApprovedThisTxId:", {
      txId,
      userId,
      decisions_map: decisionsState.decisions_map,
      decisions: decisionsState.decisions_map[txId] || [],
    });

    if (!userId || !txId) return false;

    const decisions = decisionsState.decisions_map[txId] || [];
    const userDecision = decisions.find((decision) => decision[0] === userId);
    const result = userDecision ? userDecision[1] === true : false;

    console.log("Found decision:", { userDecision, result });
    return result;
  }
);

export const { reducer: decisionsReducer } = decisionsSlice;
