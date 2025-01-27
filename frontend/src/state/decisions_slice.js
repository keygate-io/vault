import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";
import { createSelector } from "reselect";

// Async thunk for fetching all decisions
export const fetchDecisions = createAsyncThunk(
  "decisions/fetchDecisions",
  async (_, { rejectWithValue }) => {
    try {
      const repository = getRepository("decisions");
      const decisions = await repository.getAll();
      return decisions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for recording a decision
export const recordDecision = createAsyncThunk(
  "decisions/recordDecision",
  async (
    { vaultId, transactionId, isApproval },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState();
      console.log("state", state);
      const userId = state.session.user?.id;

      if (!userId) {
        return rejectWithValue("User must be logged in to record a decision");
      }

      // Check if user has already approved
      const hasApproved = hasUserApprovedThisTxId(
        state,
        vaultId,
        transactionId,
        userId
      );

      if (hasApproved) {
        return rejectWithValue("User has already approved this transaction");
      }

      const repository = getRepository("decisions");
      const allDecisions = await repository.recordDecision(
        vaultId,
        transactionId,
        isApproval,
        userId
      );

      // Extract decisions for the specific vault and transaction
      const decisionsForTx = allDecisions[vaultId]?.[transactionId] || [];

      return {
        vaultId,
        txId: transactionId,
        decisions: decisionsForTx,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state and slice setup remains the same
const initialState = {
  decisions_map: {},
  decisionsLoading: false,
  error: null,
};

export const decisionsSlice = createSlice({
  name: "decisions",
  initialState,
  extraReducers: (builder) => {
    builder
      // ... existing fetchDecisions cases
      .addCase(recordDecision.pending, (state) => {
        state.decisionsLoading = true;
        state.error = null;
      })
      .addCase(recordDecision.fulfilled, (state, action) => {
        state.decisionsLoading = false;
        state.error = null;
        const { vaultId, txId, decisions } = action.payload;

        if (!state.decisions_map[vaultId]) {
          state.decisions_map[vaultId] = {};
        }

        state.decisions_map[vaultId][txId] = decisions;
      })
      .addCase(recordDecision.rejected, (state, action) => {
        console.warn("Could not record decision", action.payload);
        state.decisionsLoading = false;
        state.error = action.payload;
      });
  },
});

// Selectors and helper functions remain unchanged
const selectDecisionsState = (state) => state.decisions;

const selectDecisionsForTx = createSelector(
  [selectDecisionsState, (_, vaultId) => vaultId, (_, __, txId) => txId],
  (decisionsState, vaultId, txId) => {
    return decisionsState.decisions_map[vaultId]?.[txId] || [];
  }
);

export const selectDecisionsCount = createSelector(
  [selectDecisionsForTx],
  (decisions) => decisions.length
);

export const selectApprovalsCount = createSelector(
  [selectDecisionsForTx],
  (decisions) => decisions.filter((decision) => decision[1] === true).length
);

export const selectRejectionsCount = createSelector(
  [selectDecisionsForTx],
  (decisions) => decisions.filter((decision) => decision[1] === false).length
);

export const hasUserApprovedThisTxId = createSelector(
  [selectDecisionsForTx, (_, __, ___, userId) => userId],
  (decisions, userId) => {
    if (!userId) return false;
    const userDecision = decisions.find((decision) => decision[0] === userId);
    return userDecision ? userDecision[1] === true : false;
  }
);

export const { reducer: decisionsReducer } = decisionsSlice;
