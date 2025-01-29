import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";
import { createSelector } from "reselect";
import { toaster } from "@/components/ui/toaster";

// Async thunks
export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (vaultId, { rejectWithValue }) => {
    try {
      const repository = getRepository("transactions");
      const transactions = await repository.getAllTxsForVaultId(vaultId);
      return transactions;
    } catch (error) {
      console.error("Error in fetchTransactions", error);
      return rejectWithValue(error.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (transactionData) => {
    const repository = getRepository("transactions");
    const transaction = await repository.create(transactionData);
    return transaction;
  }
);

export const executeTransaction = createAsyncThunk(
  "transactions/executeTransaction",
  async ({ vaultId, transactionId }, { rejectWithValue }) => {
    try {
      if (!vaultId) {
        return rejectWithValue("executeTransaction missing param vaultId");
      }
      if (!transactionId) {
        return rejectWithValue(
          "executeTransaction missing param transactionId"
        );
      }

      const repository = getRepository("transactions");
      const executedTransaction = await repository.execute(
        vaultId,
        transactionId
      );
      toaster.create({
        description: "Transaction executed! View in Executed tab.",
        type: "success",
      });

      return executedTransaction;
    } catch (error) {
      console.error("Error in executeTransaction", error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  transactions_list: [],
  fetchLoading: false,
  createLoading: false,
  error: null,
  executeLoadingStates: {}, // Track individual execution loading states
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.transactions_list = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload;
      })
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.createLoading = false;
        state.transactions_list.push(action.payload);
        state.error = null;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Execute transaction
      .addCase(executeTransaction.pending, (state, action) => {
        const { transactionId } = action.meta.arg;
        state.executeLoadingStates[transactionId] = true;
        state.error = null;
      })
      .addCase(executeTransaction.fulfilled, (state, action) => {
        const { transactionId } = action.meta.arg;
        delete state.executeLoadingStates[transactionId];
        state.error = null;

        const index = state.transactions_list.findIndex(
          (tx) => tx.id === action.payload.id
        );
        if (index !== -1) {
          state.transactions_list[index] = action.payload;
        }
      })
      .addCase(executeTransaction.rejected, (state, action) => {
        const { transactionId } = action.meta.arg;
        delete state.executeLoadingStates[transactionId];
        state.error = action.payload;
      });
  },
});

// Selectors
const selectTransactionsState = (state) => state.transactions;

export const isExecutionLoading = createSelector(
  [selectTransactionsState, (_, txId) => txId],
  (transactionsState, txId) =>
    Boolean(transactionsState.executeLoadingStates[txId])
);

export const { reducer: transactionsReducer } = transactionsSlice;
