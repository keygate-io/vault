import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";

// Async thunk for approving a transaction
export const approveTransaction = createAsyncThunk(
  "approvals/approveTransaction",
  async (transactionId, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("transactions");
      const repository = new RepositoryType();
      const transaction = await repository.approve(transactionId);
      return transaction;
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
        state.approvals_map[action.payload.id] = action.payload;
      })
      .addCase(approveTransaction.rejected, (state, action) => {
        state.approveLoading = false;
        state.error = action.payload;
      });
  },
});

export const { reducer: approvalsReducer } = approvalsSlice;
