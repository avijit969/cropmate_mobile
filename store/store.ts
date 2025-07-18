import sensorDataSlice from "@/features/sensordata/sensorDataSclice";
import userSlice from "@/features/user/userSclice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    user: userSlice,
    sensorData: sensorDataSlice,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
