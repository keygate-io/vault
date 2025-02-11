import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { container } from "@/inversify.config";
import { SIGNER_REPOSITORY } from "@/repository/signers";
import { toaster } from "@/components/ui/toaster";

// Async thunks
export const fetchSignersForVault = createAsyncThunk(
  "signers/getSigners",
  async (vaultId, { rejectWithValue }) => {
    try {
      const repository = container.get(SIGNER_REPOSITORY);
      const signers = await repository.getSignersByVaultId(vaultId);
      return {
        vaultId,
        signers,
      };
    } catch (error) {
      console.error("Error in fetchSignersForVault:", error);
      // toaster.create({
      //   description: error.isApiError
      //     ? error.message
      //     : "Failed to fetch signers",
      //   type: "error",
      //   duration: error.isApiError ? 5000 : 3000,
      // });
      return rejectWithValue(error.message);
    }
  }
);

export const addSignerToVault = createAsyncThunk(
  "signers/addSigner",
  async ({ vaultId, signerId }, { rejectWithValue }) => {
    try {
      const repository = container.get(SIGNER_REPOSITORY);
      const signersMap = await repository.addSignerToWallet(vaultId, signerId);
      toaster.create({
        description: "Signer added successfully!",
        type: "success",
      });
      return signersMap;
    } catch (error) {
      console.error("Error in addSignerToVault:", error);
      toaster.create({
        description: error.isApiError ? error.message : "Failed to add signer",
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

export const removeSignerFromVault = createAsyncThunk(
  "signers/removeSigner",
  async ({ vaultId, signerId }, { rejectWithValue }) => {
    try {
      const repository = container.get(SIGNER_REPOSITORY);
      const signersMap = await repository.removeSignerFromWallet(
        vaultId,
        signerId
      );
      toaster.create({
        description: "Signer removed successfully!",
        type: "success",
      });
      return signersMap;
    } catch (error) {
      console.error("Error in removeSignerFromVault:", error);
      toaster.create({
        description: error.isApiError
          ? error.message
          : "Failed to remove signer",
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  signers_map: {},
  invitations: [],
  loading: true,
  error: null,
};

// Create slice
export const signersSlice = createSlice({
  name: "signers",
  initialState,
  reducers: {
    setInvitations: (state, action) => {
      state.invitations = action.payload;
    },
  },
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

export const selectPendingInvitations = createSelector(
  [selectSignersState],
  (signersState) =>
    signersState.invitations.filter((invite) => !invite.executed) || []
);

export const { setInvitations, reducer: signersReducer } = signersSlice;
