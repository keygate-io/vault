import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { container } from "@/inversify.config";
import { TRANSACTIONS_REPOSITORY } from "@/repository/transactions";
import { createSelector } from "reselect";
import { toaster } from "@/components/ui/toaster";
import { VAULTS_REPOSITORY } from "@/repository/vaults";
import { ErrorToast } from "@/components/ui/error-toast";
import { createElement } from "react";

// Async thunks
export const fetchAllTransactions = createAsyncThunk(
  "transactions/fetchAllTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const repository = container.get(TRANSACTIONS_REPOSITORY);
      const transactions = await repository.getAll();
      return transactions;
    } catch (error) {
      console.error("Error in fetchAllTransactions", error);
      toaster.create({
        description: error.message || "Failed to fetch all transactions",
        type: "error",
      });
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (vaultId, { rejectWithValue }) => {
    try {
      const repository = container.get(TRANSACTIONS_REPOSITORY);
      const transactions = await repository.getAllTxsForVaultId(vaultId);
      return transactions;
    } catch (error) {
      console.error("Error in fetchTransactions", error);
      toaster.create({
        description: error.message || "Failed to fetch transactions",
        type: "error",
      });
      return rejectWithValue(error.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async ({ transaction }, { rejectWithValue }) => {
    try {
      const repository = container.get(TRANSACTIONS_REPOSITORY);
      const createdTransaction = await repository.create(transaction);
      toaster.create({
        description: "Transaction proposed successfully!",
        type: "success",
      });
      return createdTransaction;
    } catch (error) {
      console.error("Error in createTransaction", error);
      toaster.create({
        description: error.isApiError
          ? error.message
          : "Failed to create transaction",
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

export const executeTransaction = createAsyncThunk(
  "transactions/execute",
  async ({ vaultId, transactionId }, { rejectWithValue, getState }) => {
    try {
      if (!vaultId) {
        toaster.create({
          description: "Missing vault ID",
          type: "error",
        });
        return rejectWithValue("execute missing param vaultId");
      }
      if (!transactionId) {
        toaster.create({
          description: "Missing transaction ID",
          type: "error",
        });
        return rejectWithValue("execute missing param transactionId");
      }

      const repository = container.get(TRANSACTIONS_REPOSITORY);
      const executedTransaction = await repository.execute(
        Number(vaultId),
        transactionId
      );
      toaster.create({
        description: "Proposal executed! View in Executed tab.",
        type: "success",
      });

      return executedTransaction;
    } catch (error) {
      console.error("Error in execute", error);
      const userMessage =
        error.code === BigInt(500)
          ? "Due to internal server issues, we could not process your proposal. Please contact us immediately to resolve this issue."
          : error.isApiError
          ? error.message
          : "Failed to execute proposal";

      const technicalDetails = JSON.stringify({
        message: error.message,
        code: error.code?.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      toaster.create({
        description: createElement(ErrorToast, {
          message: userMessage,
          technicalDetails: technicalDetails,
        }),
        type: "error",
        duration: 7000,
      });
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  transactions_list: [],
  fetchLoading: false,
  fetchAllLoading: false,
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
      // Fetch all transactions
      .addCase(fetchAllTransactions.pending, (state) => {
        state.fetchAllLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.fetchAllLoading = false;
        state.transactions_list = action.payload;
        state.error = null;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.fetchAllLoading = false;
        state.error = action.payload;
        toaster.create({
          description: action.payload || "Failed to fetch all transactions",
          type: "error",
        });
      })
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
        toaster.create({
          description: action.payload || "Failed to fetch transactions",
          type: "error",
        });
      })
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.createLoading = false;
        console.log("createTransaction fulfilled payload", action.payload);
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
