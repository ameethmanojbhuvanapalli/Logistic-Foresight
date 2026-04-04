const createAnalyticsSlice = (set) => ({
  weeks: 3,
  hours: 5,
  predictedOrders: 0,

  actualOrders: 0,
  rmse: 0, // RMSE value

  setWeeks: (weeks) => set({ weeks }),
  setHours: (hours) => set({ hours }),
  setPredictedOrders: (orders) => set({ predictedOrders: orders }),
  setActualOrders: (orders) => set({ actualOrders: orders }),
  setRmse: (value) => set({ rmse: value })
});

export default createAnalyticsSlice;
