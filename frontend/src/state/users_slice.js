import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRepository } from "@/constants/module_config";
import { createSelector } from "reselect";

export const registerUser = createAsyncThunk(
  "users/register",
  async (userData, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("users");
      const repository = new RepositoryType();
      const user = await repository.register(userData);
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "users/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("users");
      const repository = new RepositoryType();
      const users = await repository.getAll();
      return users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserById = createAsyncThunk(
  "users/deleteById",
  async (userId, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("users");
      const repository = new RepositoryType();
      await repository.deleteById(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserById = createAsyncThunk(
  "users/getById",
  async (userId, { rejectWithValue }) => {
    try {
      const RepositoryType = getRepository("users");
      const repository = new RepositoryType();
      const user = await repository.getById(userId);
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users_list: [],
  error: null,
  loading: false,
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.users_list.push(action.payload);
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetAll
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users_list = action.payload;
        state.loading = false;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // DeleteById
      .addCase(deleteUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.users_list = state.users_list.filter(
          (user) => user.id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetById
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        const index = state.users_list.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users_list[index] = action.payload;
        } else {
          state.users_list.push(action.payload);
        }
        state.loading = false;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Derived selectors
const selectUsers = (state) => state.users.users_list;

export const selectUsersByIds = createSelector(
  [selectUsers, (_, ids) => ids],
  (users, ids) => users.filter((user) => ids.includes(user.id))
);

export const { reducer: usersReducer } = usersSlice;
