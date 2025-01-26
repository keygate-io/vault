import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";

const initialState = {
  user: null,
  vault: null,
  error: null,
  loginLoading: false,
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
      console.log("Current user", user);
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
      state.loginLoading = false;
    });
    builder.addCase(login.pending, (state) => {
      state.loginLoading = true;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.error = action.payload;
      state.loginLoading = false;
    });
    builder.addCase(fetchSession.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.vault = action.payload.vault;
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

export const { actions, reducer: sessionReducer } = sessionSlice;
