import { createAsyncThunk } from "@reduxjs/toolkit";
import { container } from "@/inversify.config";
import { INVITATIONS_REPOSITORY } from "@/repository/invitations";
import { SIGNER_REPOSITORY } from "@/repository/signers";
import { toaster } from "@/components/ui/toaster";
import { ErrorToast } from "@/components/ui/error-toast";
import { createElement } from "react";
import { createSelector } from "reselect";
import { createSlice } from "@reduxjs/toolkit";

export const fetchAllInvitations = createAsyncThunk(
  "invitations/fetchAllInvitations",
  async (_, { rejectWithValue }) => {
    try {
      const repository = container.get(INVITATIONS_REPOSITORY);
      const invitations = await repository.getInvitations();
      return invitations;
    } catch (error) {
      console.error("Error in fetchAllInvitations", error);

      const userMessage = error.isApiError
        ? error.message
        : "Failed to fetch all invitations";

      const technicalDetails = JSON.stringify({
        message: error.message,
        code: error.code?.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      toaster.create({
        description: createElement(ErrorToast, {
          message: userMessage,
          technicalDetails: technicalDetails,
        }),
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

export const executeInvitation = createAsyncThunk(
  "invitations/executeInvitation",
  async ({ invitationId }, { rejectWithValue }) => {
    try {
      const repository = container.get(INVITATIONS_REPOSITORY);
      await repository.execute(invitationId);
      return invitationId;
    } catch (error) {
      console.error("Error in executeInvitation", error);

      const userMessage = error.isApiError
        ? error.message
        : "Failed to execute invitation";

      const technicalDetails = JSON.stringify({
        message: error.message,
        code: error.code?.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      toaster.create({
        description: createElement(ErrorToast, {
          message: userMessage,
          technicalDetails: technicalDetails,
        }),
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

export const invite = createAsyncThunk(
  "invitations/invite",
  async ({ vaultId, principalId }, { rejectWithValue }) => {
    try {
      if (!principalId?.trim()) {
        throw new Error("Please enter a Principal ID");
      }

      const repository = container.get(INVITATIONS_REPOSITORY);
      const proposal = await repository.invite(vaultId, principalId);

      toaster.create({
        description: "Invite proposal created successfully.",
        type: "success",
      });

      return proposal;
    } catch (error) {
      console.error("Error in invite:", error);
      toaster.create({
        description: error.isApiError
          ? error.message
          : error.message || "Failed to create invite proposal",
        type: "error",
        duration: error.isApiError ? 5000 : 3000,
      });
      return rejectWithValue(error.message);
    }
  }
);

export const selectInvitations = (state) => state.invitations.invitations;

export const selectInvitationsLoading = (state) => state.invitations.loading;

export const selectPendingInvitations = createSelector(
  (state) => state.invitations.invitations,
  (invitations) => invitations.filter((invitation) => !invitation.executed)
);

export const selectInvitationExecutionLoading = (state, invitationId) =>
  state.invitations.executingInvitations.includes(invitationId);

const initialState = {
  invitations: [],
  loading: false,
  error: null,
  executingInvitations: [],
};

const invitationsSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllInvitations.fulfilled, (state, action) => {
        state.loading = false;
        state.invitations = action.payload;
        state.error = null;
      })
      .addCase(fetchAllInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(executeInvitation.pending, (state, action) => {
        state.executingInvitations.push(action.meta.arg.invitationId);
      })
      .addCase(executeInvitation.fulfilled, (state, action) => {
        state.executingInvitations = state.executingInvitations.filter(
          (id) => id !== action.meta.arg.invitationId
        );
        const invitation = state.invitations.find(
          (i) => i.id === action.meta.arg.invitationId
        );
        if (invitation) {
          invitation.executed = true;
        }
      })
      .addCase(executeInvitation.rejected, (state, action) => {
        state.executingInvitations = state.executingInvitations.filter(
          (id) => id !== action.meta.arg.invitationId
        );
      })
      .addCase(invite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(invite.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Convert BigInt id to string before storing in state
        const proposal = {
          ...action.payload,
          id: action.payload.id.toString(),
        };
        state.invitations.push(proposal);
      })
      .addCase(invite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { reducer: invitationsReducer } = invitationsSlice;
