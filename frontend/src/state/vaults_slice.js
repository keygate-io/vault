import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";
import { createSelector } from "reselect";

// Async thunks
export const fetchVaultById = createAsyncThunk(
  "vaults/getVault",
  async (vaultId, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("vaults");
      const repository = new RepositoryType();
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
      const RepositoryType = getRepository("vaults");
      const repository = new RepositoryType();
      const vaults = await repository.getAll();
      return vaults;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  vaults_map: {},
  loading: false,
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
      });
  },
});

// Selectors
const selectVaultsState = (state) => state.vaults;

export const selectVaultById = createSelector(
  [selectVaultsState, (_, vaultId) => vaultId],
  (vaultsState, vaultId) => vaultsState.vaults_map[vaultId]
);

export const selectVaultThreshold = createSelector(
  [selectVaultById, (_, vaultId) => vaultId],
  (vault) => vault?.threshold || 1
);

export const selectVaultBalance = createSelector(
  [selectVaultById, (_, vaultId) => vaultId],
  (vault) => vault?.balance || 0
);

export const { reducer: vaultsReducer } = vaultsSlice;
