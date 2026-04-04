import { create } from "zustand";
import createDeliverySlice from "./deliverySlice";
import createAnalyticsSlice from "./analyticsSlice"
import createCounterSlice from "./counterSlice";

const useStore = create((set) => ({
  ...createDeliverySlice(set),
  ...createAnalyticsSlice(set),
  ...createCounterSlice(set)
}));

export default useStore;