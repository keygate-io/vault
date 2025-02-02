import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { container } from "@/inversify.config";
import { SESSION_REPOSITORY } from "@/repository/session";

const initialState = {
  user: null,
  vault: null,
  error: null,
  isAuthenticating: false,
  isAuthenticated: false,
};

export const initialize = createAsyncThunk(
  "session/initialize",
  async (agent, { rejectWithValue }) => {
    try {
      const repository = container.get(SESSION_REPOSITORY);
      const { user } = await repository.initialize(agent);
      return { user };
    } catch (error) {
      console.error("Error setting authenticated agent", error);
      return rejectWithValue(error.message);
    }
  }
);

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(initialize.fulfilled, (state, action) => {
      state.error = null;
      state.isAuthenticated = true;
      state.isAuthenticating = false;
      state.user = action.payload.user;
    });
    builder.addCase(initialize.pending, (state) => {
      state.isAuthenticating = true;
      state.isAuthenticated = false;
      state.error = null;
    });
    builder.addCase(initialize.rejected, (state, action) => {
      state.error = action.payload;
      state.isAuthenticating = false;
      state.isAuthenticated = false;
    });
  },
});

// Derived selectors
export const selectCurrentUser = (state) => state.session.user;
export const selectCurrentVault = (state) => state.session.vault;
export const selectCurrentVaultId = (state) => state.session.vault?.id;
export const selectCurrentUserId = (state) => state.session.user?.id;
export const selectIsAuthenticated = (state) => state.session.isAuthenticated;
export const selectIsAuthenticating = (state) => state.session.isAuthenticating;

export const { actions, reducer: sessionReducer } = sessionSlice;
