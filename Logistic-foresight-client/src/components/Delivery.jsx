import { useState, useEffect } from "react";
import useStore from "../store"; // Zustand store
import Map from "./Map"; // Custom Map component
import usePost from "../hooks/usePost"; // Import the usePost hook
import useGet from "../hooks/useGet";
import { toast } from "react-toastify";

function Delivery() {
  //API Host
const serviceUrl = import.meta.env.VITE_DELIVERY_SERVICE_URL;

  const {
    vehicleCapacity,
    //warehouseLatLong,
    warehouseLat,
    warehouseLong,
    setVehicleCapacity,
    //setWarehouseLatLong,
    setWarehouseLat,
    setWarehouseLong,
    setMapData,
    mapData
  } = useStore();

  // Use the usePost hook for POST requests
  const {
    postData,
    loading: postLoading,
    error: postError
  } = usePost(`${serviceUrl}/api/orders/cluster`);

  // Use the useGet hook for GET requests
  const {
    data: initialData,
    loading: getLoading,
    error: getError,
    refetch
  } = useGet(`${serviceUrl}/api/orders/clusters`);

  // Fetch clusters on component load and update the state
  useEffect(() => {
    if (initialData) {
      console.log("Initial clustering data:", initialData);
      setMapData(initialData);
    }
  }, [initialData, setMapData]);

  // Callback to refresh data after delivery
  const refreshClusters = async () => {
    // Refetch the data from the GET API
    await refetch();
  };

  const [loading, setLoading] = useState(false);
  // Handle clustering logic when "Cluster Now" button is clicked
  const handleClusterNow = async () => {
    const payload = {
      VehicleCapacity: Number(vehicleCapacity),
      Warehouse: { Latitude: warehouseLat, Longitude: warehouseLong }
    };

    try {
      console.log("Sending payload for clustering:", payload);
      setLoading(true);
      // Send POST request
      const response = await fetch(
        `${serviceUrl}/api/orders/cluster`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const responseData = await response.json();

      console.log("Clustering successful:", typeof responseData);
      setLoading(false);
      // Update map data with the returned data
      setMapData(responseData);

      toast.success("Clustering successful!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });
      //refreshClusters();
    } catch (error) {
      console.log("Error during clustering:", error);
      setLoading(false);

      toast.error("Error during clustering:", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });
    }
  };

  return (
    <div className="mt-2 flex flex-col space-x-8">
      <h2 className="font-bold text-3xl text-[#ff8c8c] mb-2">Delivery</h2>

      <div className="border p-2 w-full space-y-2">
        <div className="flex justify-center space-x-5">
          {/* Vehicle Capacity Input */}
          <div>
            <span className="text-xl mr-4 mb-3">Vehicle Capacity: </span>
            <input
              className="border-2 border-[#ff8c8c] rounded-sm outline-none p-1"
              type="number"
              name="capacity"
              id="capacity"
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(Number(e.target.value))} // Update Zustand store
            />
          </div>

          {/* Warehouse Latitude/Longitude Input */}
          <div>
            <span className="text-xl mr-4 mb-3">Warehouse Lat: </span>
            <input
              className="border-2 border-[#ff8c8c] rounded-sm outline-none p-1"
              type="text"
              name="latlong"
              id="latlong"
              value={warehouseLat}
              onChange={(e) => setWarehouseLat(e.target.value)} // Update Zustand store
            />
          </div>
          {/* Warehouse Latitude/Longitude Input */}
          <div>
            <span className="text-xl mr-4 mb-3">Warehouse Long: </span>
            <input
              className="border-2 border-[#ff8c8c] rounded-sm outline-none p-1"
              type="text"
              name="latlong"
              id="latlong"
              value={warehouseLong}
              onChange={(e) => setWarehouseLong(e.target.value)} // Update Zustand store
            />
          </div>
        </div>

        {/* Cluster Now Button */}
        <div className="flex items-center justify-center">
          <button
            className="flex items-center px-3 py-2 bg-[#ff8c8c] hover:bg-[#e96868] rounded-md text-white"
            onClick={handleClusterNow}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Clustering..." : "Cluster Now"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 16 16"
              className="ml-2">
              <path
                fill="#ffffff"
                d="M14 12a2 2 0 0 0-1.008.305L10.78 10.15a3.44 3.44 0 0 0 .74-1.993L13.09 8a1.49 1.49 0 1 0-.089-.768l-1.591.128a3.51 3.51 0 0 0-1.978-2.521L9.74 4H10a2 2 0 1 0-1.01-.265l-.27.855a3.3 3.3 0 0 0-.754-.084c-.83 0-1.59.296-2.181.789L2.791 2.291a1.5 1.5 0 1 0-1.291.71c.281-.001.544-.079.767-.214L5.26 5.791a3.45 3.45 0 0 0-.76 2.168v.203l-.66.11a2 2 0 1 0 .161.786L4 8.999l.63-.097a3.52 3.52 0 0 0 1.466 1.992l-.556 1.188a2 2 0 0 0-.539-.08h-.017a2 2 0 1 0 1.231.423l.566-1.153c.364.146.787.231 1.229.231c.847 0 1.621-.311 2.216-.824l2.176 2.124a2 2 0 1 0 1.6-.8zm-9 3a1 1 0 1 1 0-2a1 1 0 0 1 0 2m3-4.5a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5"
              />
            </svg>
          </button>
        </div>

        {/* Display error message if there is an error */}
        {postError && (
          <div className="text-red-500">Error: {postError.message}</div>
        )}
      </div>

      {/* Pass mapData and refresh callback to Map component */}
      <div className="w-full mt-3 flex justify-center z-0">
        <Map mapData={mapData} refreshClusters={refreshClusters} />
      </div>
    </div>
  );
}

export default Delivery;