import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { container } from "@/inversify.config";
import { SESSION_REPOSITORY } from "@/repository/session";
import { toaster } from "@/components/ui/toaster";

const initialState = {
  user: null,
  vault: null,
  error: null,
  isAuthenticating: false,
  isAuthenticated: false,
};

export const logout = createAsyncThunk(
  "session/logout",
  async (_, { rejectWithValue }) => {
    try {
      const repository = container.get(SESSION_REPOSITORY);
      await repository.logout();
      return null;
    } catch (error) {
      console.error("Error during logout", error);
      return rejectWithValue(error.message);
    }
  }
);

export const initialize = createAsyncThunk(
  "session/initialize",
  async (agent, { dispatch, rejectWithValue }) => {
    try {
      const repository = container.get(SESSION_REPOSITORY);
      const { user } = await repository.initialize(agent);
      return { user };
    } catch (error) {
      console.error("Error setting authenticated agent", error);
      toaster.create({
        description: error.isApiError ? error.message : "Failed to initialize session",
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
      // Trigger logout when initialization fails
      dispatch(logout());
      return rejectWithValue(error.message);
    }
  }
);

export const focus = createAsyncThunk(
  "session/focus",
  async (vault_input, { rejectWithValue }) => {
    try {
      const repository = container.get(SESSION_REPOSITORY);
      const vault = await repository.focus(vault_input);
      return vault;
    } catch (error) {
      console.error("Error focusing on vault", error);
      toaster.create({
        description: error.isApiError ? error.message : "Failed to connect to vault",
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
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
    builder.addCase(focus.fulfilled, (state, action) => {
      state.error = null;
      state.vault = action.payload.vault;
    });
    builder.addCase(focus.pending, (state) => {
      state.error = null;
    });
    builder.addCase(focus.rejected, (state, action) => {
      state.error = action.payload;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.vault = null;
      state.error = null;
      state.isAuthenticated = false;
      state.isAuthenticating = false;
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
