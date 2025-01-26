import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";
import { createSelector } from "reselect";

// Async thunks
export const fetchSignersForVault = createAsyncThunk(
  "signers/getSigners",
  async (vaultId, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("signers");
      const repository = new RepositoryType();
      const signers = await repository.getSignersByVaultId(vaultId);
      return {
        vaultId,
        signers,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addSignerToVault = createAsyncThunk(
  "signers/addSigner",
  async ({ vaultId, signerId }, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("signers");
      const repository = new RepositoryType();
      const signersMap = await repository.addSignerToWallet(vaultId, signerId);
      return signersMap;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeSignerFromVault = createAsyncThunk(
  "signers/removeSigner",
  async ({ vaultId, signerId }, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("signers");
      const repository = new RepositoryType();
      const signersMap = await repository.removeSignerFromWallet(
        vaultId,
        signerId
      );
      return signersMap;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  signers_map: {},
  loading: false,
  error: null,
};

// Create slice
export const signersSlice = createSlice({
  name: "signers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get signers cases
      .addCase(fetchSignersForVault.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSignersForVault.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.signers_map[action.payload.vaultId] = action.payload.signers;
      })
      .addCase(fetchSignersForVault.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add signer cases
      .addCase(addSignerToVault.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSignerToVault.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.signers_map = action.payload;
      })
      .addCase(addSignerToVault.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove signer cases
      .addCase(removeSignerFromVault.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSignerFromVault.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.signers_map = action.payload;
      })
      .addCase(removeSignerFromVault.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
const selectSignersState = (state) => state.signers;

export const selectVaultSigners = createSelector(
  [selectSignersState, (state, vaultId) => vaultId],
  (signersState, vaultId) => signersState.signers_map[vaultId] || []
);

export const { reducer: signersReducer } = signersSlice;
