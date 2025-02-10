import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";
import { createSelector } from "reselect";
import { container } from "../inversify.config";
import { VAULTS_REPOSITORY } from "@/repository/vaults";
import { toaster } from "@/components/ui/toaster";

// Async thunks
export const fetchVaultById = createAsyncThunk(
  "vaults/getVault",
  async (vaultId, { rejectWithValue }) => {
    try {
      const repository = getRepository("vaults");
      const vault = await repository.getById(vaultId);
      return vault;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVaults = createAsyncThunk(
  "vaults/fetchVaults",
  async (_, { rejectWithValue }) => {
    try {
      const repository = container.get(VAULTS_REPOSITORY);
      const vaults = await repository.getAll();
      return vaults;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVaultBalance = createAsyncThunk(
  "vaults/fetchBalance",
  async (vaultId, { rejectWithValue }) => {
    try {
      const repository = container.get(VAULTS_REPOSITORY);
      const balance = await repository.getBalance(vaultId);
      return { vaultId, balance };
    } catch (error) {
      console.error("Error fetching balance:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const createVault = createAsyncThunk(
  "vaults/createVault",
  async ({ name }, { rejectWithValue }) => {
    try {
      const repository = container.get(VAULTS_REPOSITORY);
      const vault = await repository.create({ name });

      toaster.create({
        description: "Vault created successfully!",
        type: "success",
      });
      return vault;
    } catch (error) {
      console.error("Error in createVault", error);
      toaster.create({
        description: error.isApiError
          ? error.message
          : "Failed to create vault",
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  vaults_map: {},
  loading: true,
  creating: false,
  error: null,
  balance_loading: true,
  balance_error: null,
};

// Create slice
export const vaultsSlice = createSlice({
  name: "vaults",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get vault cases
      .addCase(fetchVaultById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVaultById.fulfilled, (state, action) => {
        state.error = null;
        if (action.payload) {
          state.vaults_map[action.payload.id] = action.payload;
        }
      })
      .addCase(fetchVaultById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVaults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVaults.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.vaults_map = action.payload;
      })
      .addCase(fetchVaults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create vault cases
      .addCase(createVault.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createVault.fulfilled, (state, action) => {
        state.creating = false;
        state.error = null;
        state.vaults_map[action.payload.id] = action.payload;
      })
      .addCase(createVault.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Balance fetching cases
      .addCase(fetchVaultBalance.pending, (state) => {
        state.balance_loading = true;
        state.balance_error = null;
      })
      .addCase(fetchVaultBalance.fulfilled, (state, action) => {
        state.balance_loading = false;
        state.balance_error = null;
        const { vaultId, balance } = action.payload;

        if (state.vaults_map[vaultId]) {
          state.vaults_map[vaultId].balance = balance;
        }
      })
      .addCase(fetchVaultBalance.rejected, (state, action) => {
        state.balance_loading = false;
        state.balance_error = action.payload;
      });
  },
});

// Selectors
export const selectVaults = (state) => state.vaults.vaults_map;

export const selectVaultById = createSelector(
  [selectVaults, (_, vaultId) => vaultId],
  (vaultsMap, vaultId) => vaultsMap[vaultId]
);

export const selectVaultThreshold = createSelector(
  [selectVaultById, (_, vaultId) => vaultId],
  (vault) => vault?.threshold || 1
);

export const selectVaultBalance = createSelector(
  [selectVaultById, (_, vaultId) => vaultId],
  (vault) => vault?.balance || 0
);

export const selectIsCreatingVault = (state) => state.vaults.creating;

export const selectIsBalanceLoading = (state) => state.vaults.balance_loading;
export const selectBalanceError = (state) => state.vaults.balance_error;

export const { reducer: vaultsReducer } = vaultsSlice;
