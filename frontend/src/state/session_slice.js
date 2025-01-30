import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";

const initialState = {
  user: null,
  vault: null,
  error: null,
  isAuthenticating: true,
  isAuthenticated: false,
};

export const login = createAsyncThunk(
  "session/login",
  async (_, { rejectWithValue }) => {
    try {
      const repository = getRepository("session");
      const user = await repository.login();
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSession = createAsyncThunk(
  "session/fetchSession",
  async (_, { rejectWithValue }) => {
    try {
      const repository = getRepository("session");
      const user = await repository.fetchSession();
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.vault = action.payload.vault;
      state.error = null;
      state.isAuthenticated = true;
      state.isAuthenticating = false;
    });
    builder.addCase(login.pending, (state) => {
      state.isAuthenticating = true;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.error = action.payload;
      state.isAuthenticating = false;
    });
    builder.addCase(fetchSession.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.vault = action.payload.vault;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(fetchSession.pending, (state) => {
      state.fetchSessionLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSession.rejected, (state, action) => {
      state.error = action.payload;
      state.fetchSessionLoading = false;
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
