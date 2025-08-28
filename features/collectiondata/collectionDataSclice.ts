import { CollectionData, SensorData } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: CollectionData = {
  farmerName: "",
  cropName: "",
  stateName: "",
  districtName: "",
  villageName: "",
  latitude: "",
  longitude: "",
  areaImage: "",
  soilImage: "",
  seasonalCropType: "",
  sensorData: {},
};

const collectionDataSlice = createSlice({
  name: "collectionData",
  initialState: initialState,
  reducers: {
    addBasicInformation: (
      state,
      action: {
        payload: {
          farmerName: string;
          cropName: string;
          stateName: string;
          districtName: string;
          villageName: string;
          seasonalCropType: string;
        };
      }
    ) => {
      state.farmerName = action.payload.farmerName;
      state.cropName = action.payload.cropName;
      state.stateName = action.payload.stateName;
      state.districtName = action.payload.districtName;
      state.villageName = action.payload.villageName;
      state.seasonalCropType = action.payload.seasonalCropType;
    },
    addLocationInformation: (
      state,
      action: { payload: { latitude: string; longitude: string } }
    ) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
    },
    addAreaImage: (state, action: { payload: { areaImage: string } }) => {
      state.areaImage = action.payload.areaImage;
    },
    addSensorData: (state, action: { payload: { sensorData: SensorData } }) => {
      state.sensorData = action.payload.sensorData;
    },
    addSoilImage: (state, action: { payload: { soilImage: string } }) => {
      state.soilImage = action.payload.soilImage;
    },
    clearCollectionData: (state) => {
      state = initialState;
    },
  },
});

export const {
  addBasicInformation,
  addLocationInformation,
  addAreaImage,
  addSensorData,
  addSoilImage,
  clearCollectionData,
} = collectionDataSlice.actions;
export default collectionDataSlice.reducer;
