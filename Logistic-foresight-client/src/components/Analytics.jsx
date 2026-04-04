import { useEffect } from "react";
import LineChart from "./LineChart";
import useStore from "../store";
import usePost from "../hooks/usePost";
import { toast } from "react-toastify";
import Spinner from "./Spinner";

function Analytics() {
  //API Host
  const serviceUrl = import.meta.env.VITE_PACKING_SERVICE_URL;

  // Define the states from the store
  const {
    weeks,
    setWeeks,
    hours,
    setHours,
    futureCounters,
    predictedCounters,
    currentCounters,
    setFutureCounters,
    predictedOrders,
    setPredictedOrders,
    setPredictedCounters,
    actualOrders,
    setActualOrders,
    rmse,
    setRmse
  } = useStore();

  // Fetch data on component load or after saving new settings
  const {
    data,
    loading: postLoading,
    error: postError,
    postData
  } = usePost(`${serviceUrl}/api/forecast/prediction`);

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      const initialPayload = { weeks, hours };
      await postData(initialPayload); // Call the API with initial state (weeks and hours)
    };

    loadInitialData(); // Load data when the component mounts
  }, []); // Run only once, on mount

  // Update state whenever new data is received from the API
  useEffect(() => {
    if (data) {
      console.log("------LINE CHART TEST-BEGIN----------  ");
      console.log(data.predicted_orders?.length || 0);
      console.log(" ---------LINE CHART TEST END---------- ");

      setWeeks(data.weeks || 0);
      setHours(data.hours || 0);
      setPredictedOrders(data.predicted_orders || []);
      setActualOrders(data.actual_orders || []);
      setRmse(data.rmse || 0);
      //   setPredictedCounters(data.predicted_counters || 0);
      setFutureCounters(data.predicted_counters || 0); //future - current counters
      console.log(data.predicted_counters);
    }
  }, [data]); // This will only run when 'data' changes

  // Fetch data every hour on the hour
  useEffect(() => {
    const fetchHourlyData = async () => {
      const payload = { weeks, hours };
      await postData(payload);
    };

    // Set interval to check time every minute on the minute
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getMinutes() === 0) {
        console.log("Fetched at ", now);
        fetchHourlyData();
      }
    }, 60000); // Check every minute (60000 ms)

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [weeks, hours, postData]); // Dependency array

  // Handle save button click
  const handleSave = async () => {
    console.log("Weeks:", weeks, "Hours:", hours);
    const chartSettings = { weeks, hours };

    // Call postData to send chartSettings and refresh data
    await postData(chartSettings);

    // After successfully sending the data, the useEffect will handle updating the chart
  };

  useEffect(() => {
    if (postError) {
      toast.error("Failed to fetch chart data", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });
    }
  }, [postError]);

  return (
    <div className="mt-2 flex flex-col space-x-8">
      <h2 className="font-bold text-3xl text-[#ff8c8c] mb-2">Analytics</h2>
      <div className="border p-2 w-full space-y-2">
        <div className="flex justify-center space-x-5">
          <div>
            <span className="text-xl mr-4 mb-3">Weeks: </span>
            <input
              className="border-2 border-[#ff8c8c] rounded-sm outline-none p-1"
              type="number"
              name="weeks"
              id="weeks"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))} // Convert input to number
            />
          </div>
          <div>
            <span className="text-xl mr-4 mb-3">Hours: </span>
            <input
              className="border-2 border-[#ff8c8c] rounded-sm outline-none p-1"
              type="number"
              name="hours"
              id="hours"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))} // Convert input to number
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="px-3 py-1 bg-[#ff8c8c] hover:bg-[#e96868] rounded-md text-white"
            onClick={handleSave}
            disabled={postLoading}>
            {postLoading ? (
              <>
                <Spinner
                  spinColor="white"
                  backgroundColor="transparent"
                  width="20"
                  height="20"
                />
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
      <LineChart
        predictedOrders={predictedOrders}
        actualOrders={actualOrders}
        rmse={rmse}
        loading={postLoading}
        error={postError}
      />
    </div>
  );
}

export default Analytics;
