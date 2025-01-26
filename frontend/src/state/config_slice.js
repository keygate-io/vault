import { createSlice } from "@reduxjs/toolkit";
import { GlobalSettings } from "@/constants/global_config";

const initialState = { ...GlobalSettings };

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setFeatureEnabled: (state, action) => {
      state[action.payload.feature].enabled = action.payload.enabled;
    },
  },
});

export const { setFeatureEnabled } = configSlice.actions;
export const { actions, reducer: configReducer } = configSlice;
