const createDeliverySlice = (set) => ({
  vehicleCapacity: 0,
  warehouseLat: 12.979997278675235,
  warehouseLong: 77.57123784325745,
  mapData: [],
  setVehicleCapacity: (capacity) => set({ vehicleCapacity: capacity }),
  //setWarehouseLatLong: (latLong) => set({ warehouseLatLong: latLong }),
  setWarehouseLat: (lat) => set({ warehouseLat: lat }),
  setWarehouseLong: (long) => set({ warehouseLong: long }),
  setMapData: (data) => set({ mapData: data }),
});

export default createDeliverySlice;


