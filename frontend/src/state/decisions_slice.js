import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { container } from "@/inversify.config";
import { DECISIONS_REPOSITORY } from "@/repository/decisions";
import { createSelector } from "reselect";
import { toaster } from "@/components/ui/toaster";

// Async thunk for fetching all decisions
export const fetchDecisions = createAsyncThunk(
  "decisions/fetchDecisions",
  async (_, { rejectWithValue }) => {
    try {
      const repository = container.get(DECISIONS_REPOSITORY);
      const decisions = await repository.getAll();
      return decisions;
    } catch (error) {
      console.error("Error in fetchDecisions", error);
      toaster.create({
        description: error.isApiError
          ? error.message
          : "Failed to fetch decisions",
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
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
      const userId = state.session.user?.id;

      if (!userId) {
        const error = new Error("User must be logged in to record a decision");
        toaster.create({
          description: error.message,
          type: "error",
        });
        return rejectWithValue(error.message);
      }

      // Check if user has already approved
      const hasApproved = hasUserApprovedThisTxId(
        state,
        vaultId,
        transactionId,
        userId
      );
      if (hasApproved) {
        const error = new Error("You have already approved this transaction");
        toaster.create({
          description: error.message,
          type: "error",
        });
        return rejectWithValue(error.message);
      }

      const repository = container.get(DECISIONS_REPOSITORY);
      const allDecisions = await repository.recordDecision(
        vaultId,
        transactionId,
        isApproval,
        userId
      );

      toaster.create({
        description: isApproval
          ? "Transaction approved successfully!"
          : "Transaction rejected successfully!",
        type: "success",
      });

      // Extract decisions for the specific vault and transaction
      const decisionsForTx = allDecisions[vaultId]?.[transactionId] || [];

      return {
        vaultId,
        txId: transactionId,
        decisions: decisionsForTx,
      };
    } catch (error) {
      console.error("Error in recordDecision", error);
      toaster.create({
        description: error.isApiError
          ? error.message
          : "Failed to record decision",
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  decisions_map: {}, // Structure: { [vaultId]: { [txId]: Array<[userId, isApproval]> } }
  loadingTxIds: {}, // Map of txIds that are currently loading
  error: null,
};

export const decisionsSlice = createSlice({
  name: "decisions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all decisions
      .addCase(fetchDecisions.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchDecisions.fulfilled, (state, action) => {
        console.log("fetchDecisions fulfilled payload", action.payload);
        state.decisions_map = action.payload;
        state.error = null;
      })
      .addCase(fetchDecisions.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Record decision
      .addCase(recordDecision.pending, (state, action) => {
        const { transactionId } = action.meta.arg;
        state.loadingTxIds[transactionId] = true;
        state.error = null;
      })
      .addCase(recordDecision.fulfilled, (state, action) => {
        const { vaultId, txId, decisions } = action.payload;
        delete state.loadingTxIds[txId];

        if (!state.decisions_map[vaultId]) {
          state.decisions_map[vaultId] = {};
        }
        state.decisions_map[vaultId][txId] = decisions;
        state.error = null;
      })
      .addCase(recordDecision.rejected, (state, action) => {
        const { transactionId } = action.meta.arg;
        delete state.loadingTxIds[transactionId];
        state.error = action.payload;
      });
  },
});

// Selectors
const selectDecisionsState = (state) => state.decisions;

export const selectDecisionsForTx = createSelector(
  [selectDecisionsState, (_, vaultId) => vaultId, (_, __, txId) => txId],
  (decisionsState, vaultId, txId) => {
    return decisionsState.decisions_map[vaultId]?.[txId] || [];
  }
);

export const isTransactionLoading = createSelector(
  [selectDecisionsState, (_, txId) => txId],
  (decisionsState, txId) => Boolean(decisionsState.loadingTxIds[txId])
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

export const selectDecisionMakers = createSelector(
  [selectDecisionsForTx],
  (decisions) => decisions.map((decision) => decision[0])
);

export const selectApprovers = createSelector(
  [selectDecisionsForTx],
  (decisions) => {
    const approvers = decisions
      .filter((decision) => decision[1] === true)
      .map((decision) => decision[0]);
    return approvers;
  }
);

export const selectRejectors = createSelector(
  [selectDecisionsForTx],
  (decisions) => decisions.filter((decision) => decision[1] === false)
);

export const { reducer: decisionsReducer } = decisionsSlice;
