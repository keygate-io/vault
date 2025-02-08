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

export const createVault = createAsyncThunk(
  "vaults/createVault",
  async ({ name }, { rejectWithValue }) => {
    try {
      const repository = container.get(VAULTS_REPOSITORY);
      console.log("Creating vault with name:", name);
      const vault = await repository.create({ name });
      
      toaster.create({
        description: "Vault created successfully!",
        type: "success",
      });
      return vault;
    } catch (error) {
      console.error("Error in createVault", error);
      toaster.create({
        description: error.isApiError ? error.message : "Failed to create vault",
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
  loading: false,
  creating: false,
  error: null,
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

export const { reducer: vaultsReducer } = vaultsSlice;
