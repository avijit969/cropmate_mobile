import { SensorData } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: SensorData = {};

const sensorDataSlice = createSlice({
  name: "sensorData",
  initialState: initialState,
  reducers: {
    addSensorData: (state, action) => {
      return action.payload;
    },
    updateSensorData: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearSensorData: (state) => {
      return {};
    },
  },
});

export const { addSensorData, updateSensorData, clearSensorData } =
  sensorDataSlice.actions;
export default sensorDataSlice.reducer;
