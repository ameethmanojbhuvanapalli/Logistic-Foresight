import { useState, useEffect } from "react";
import Stomp from "stompjs";
import useGet from "../hooks/useGet";
import useStore from "../store"; // Zustand store
import axios from "axios";
import { toast, Zoom } from "react-toastify";
import Spinner from "./Spinner";

import { splitOrderInfo } from "../utils/splitOrderInfo";
import { splitCurrentFuture } from "../utils/splitCurrentFuture";
import { splitOrderMessage } from "../utils/splitOrderMessage";
import { splitCounterStatus } from "../utils/splitCounterStatus";

function CounterSettings() {
  //API Host
  const serviceUrl = import.meta.env.VITE_PACKING_SERVICE_URL;

  const {
    countdown,
    setCountdown,
    timer,
    setTimer,
    helpers,
    setHelpers,
    futureCounters,
    currentOrdersList,
    currentCountersList,
    futureCountersList,
    orderStatusMessage,
    setOrderStatusMessage,

    setFutureCounters,
    currentCounters,
    currentOrders,
    currentOrderItems,
    setCurrentCounters,
    setCurrentOrders,
    setCurrentOrderItems,
    setCurrentCountersList
  } = useStore();

  // Loading states for helpers and timers buttons
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [loadingHelpers, setLoadingHelpers] = useState(false);

  const [timerPostError, setTimerPostError] = useState(null);
  const [helpersPostError, setHelpersPostError] = useState(null);

  // Fetch timer and helpers on page load
  const {
    data: timerData,
    loading: timerLoading,
    error: timerGetError
  } = useGet(`${serviceUrl}/api/operations/current-time-limit`);
  const {
    data: helpersData,
    loading: helpersLoading,
    error: helpersGetError
  } = useGet(`${serviceUrl}/api/operations/current-helpers`);
  const {
    data: countdownData,
    loading: countdownLoading,
    error: countdownError
  } = useGet(`${serviceUrl}/api/operations/current-timer`);

  const {
    data: currentOrdersCount,
    loading: orderLoading,
    error: orderError
  } = useGet(`${serviceUrl}/api/orders/queue/total-orders`);

  const {
    data: currentOrderItemsCount,
    loading: orderItemsLoading,
    error: orderItemsError
  } = useGet(`${serviceUrl}/api/orders/queue/total-items`);

  const {
    data: currentCountersCount,
    loading: currentCountersLoading,
    error: currentCountersError
  } = useGet(`${serviceUrl}/api/counters/available-counters`);

  useEffect(() => {
    if (timerData !== null) {
      console.log("Timer data fetched:", timerData);
      setTimer(timerData); // Set the timer state
    }
    if (helpersData !== null) {
      console.log("Helpers data fetched:", helpersData);
      setHelpers(helpersData); // Set the helpers state
    }
    if (countdownData !== null) {
      console.log("Countdown data fetched:", countdownData);
      setCountdown(countdownData); // Set the countdown state
    }
    if (currentCountersCount !== null) {
      console.log("Counters data fetched:", currentCountersCount);
      setCurrentCounters(currentCountersCount);
      // Check if we need to add new countersh
      const newCounters = [];
      for (let i = 1; i <= currentCountersCount; i++) {
        newCounters.push({
          id: i, // Ensure unique ID
          isActive: true
        });
        console.log("generated counters:", newCounters);
      }

      console.log("New counters:", newCounters); //Here I can see the array
      setCurrentCountersList(newCounters);
      console.log("Updated counters list:", currentCountersList); //Here it shows []
    }
    if (currentOrdersCount !== null) {
      console.log("Orders data fetched:", currentOrdersCount);
      setCurrentOrders(currentOrdersCount);
    }
    if (currentOrderItemsCount !== null) {
      console.log("Order Items data fetched:", currentOrderItemsCount);
      setCurrentOrderItems(currentOrderItemsCount);
    }
  }, [
    timerData,
    helpersData,
    countdownData,
    currentCountersCount,
    currentOrdersCount,
    currentOrderItemsCount,
    setTimer,
    setHelpers,
    setCountdown
  ]);

  // Set up WebSocket for real-time countdown updates
  useEffect(() => {
    const socket = new WebSocket(`${serviceUrl.replace("https", "wss")}/ws`);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {};
    let connected = false;

    stompClient.connect(
      {},
      (frame) => {
        console.log("Connected to WebSocket");
        connected = true; // Mark as connected

        // Subscribe to the /topic/time-update topic
        stompClient.subscribe("/topic/time-update", (message) => {
          const updatedCountdown = JSON.parse(message.body);
          console.log("Real-time countdown update received:", updatedCountdown);

          // Update countdown state with real-time data
          setCountdown(updatedCountdown);
        });

        stompClient.subscribe("/topic/order-updates", function (message) {
          let orderInfo = message.body;
          const { currentOrders, currentOrderItems } =
            splitOrderInfo(orderInfo);
          console.log("Real-time order updates received:", orderInfo);
          setCurrentOrders(currentOrders);
          setCurrentOrderItems(currentOrderItems);

          //   const order = {

          //   }
          //   setCurrentOrdersQueue()
        });

        stompClient.subscribe("/topic/update-counter", function (message) {
          let { currentCounters, futureCounters } = splitCurrentFuture(
            message.body
          );

          // Update current counters
          setCurrentCounters(currentCounters);

          // Check if we need to add new counters
          if (currentCounters > currentCountersList.length) {
            const newCounters = currentCounters
              .slice(currentCountersList.length) // Only process the additional counters
              .map((_, index) => ({
                id: index + 1, // ID starts at 1 for each new counter
                isActive: false
              }));
            setCurrentCountersList([...currentCountersList, ...newCounters]);
          } else if (currentCounters < currentCountersList.length) {
            // If there are extra counters in currentCountersList, remove from the end
            setCurrentCountersList(
              currentCountersList.slice(0, currentCounters)
            );
          }

          // Update future counters
          setFutureCounters(futureCounters);
        });

        stompClient.subscribe("/topic/order-complete", function (message) {
          //order completion
          let { currentOrders, toastMessage } = splitOrderMessage(message.body);
          setCurrentOrders(currentOrders);
          //setOrderStatusMessage(toastMessage);

          toast.success(toastMessage, {
            position: "top-left",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Zoom,
            toastId: "unique-id", // Ensure a unique id to replace the toast
            onOpen: () => setTimeout(() => toast.dismiss("unique-id"), 3000) // Dismiss previous toast with same id after a delay
          });
        });

        stompClient.subscribe("/topic/counter-updates", function (message) {
          let { currentOrderItems, counterID, counterIDStatus } =
            splitCounterStatus(message.body);
          console.log("SPLITTED COUNTER STATUS ", currentOrderItems);
          setCurrentOrderItems(currentOrderItems);

          // Find the counter with the matching id
          const counterIndex = currentCountersList.findIndex(
            (counter) => counter.id === counterID
          );

          // If the counter is found, update its status
          if (counterIndex !== -1) {
            const newCountersList = [...currentCountersList];
            newCountersList[counterIndex].isActive = counterIDStatus === "free";
            setCurrentCountersList(newCountersList);
          }
        });
      },
      (error) => {
        console.error("WebSocket connection error:", error);
      }
    );

    return () => {
      // Check if the client is connected before attempting to disconnect
      if (connected) {
        stompClient.disconnect(() => {
          console.log("Disconnected from WebSocket");
        });
      } else {
        console.warn("WebSocket not connected, cannot disconnect.");
      }
    };
  }, []);

  // Function to handle setting a new timer
  const handleSetTimer = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoadingTimer(true);
    setCountdown(timer); //reflect the new timer in the countdown instantly
    try {
      await axios.post(
        `${serviceUrl}/api/operations/set-timer?timeLimit=${timer}`
      );
      setLoadingTimer(false);
    } catch (error) {
      console.error("Error setting timer:", error);
      setTimerPostError(error);
    } finally {
      setLoadingTimer(false);
    }
  };

  // Function to handle sending helpers
  const handleSendHelpers = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoadingHelpers(true);

    try {
      await axios.post(
        `${serviceUrl}/api/operations/set-helpers?noOfHelpers=${helpers}`
      );
      setLoadingHelpers(false);
    } catch (error) {
      console.error("Error sending helpers:", error);
      setHelpersPostError(error);
    } finally {
      setLoadingHelpers(false);
    }
  };

  //Error messages
  // Timer Post Error
  useEffect(() => {
    if (timerPostError && !toast.isActive("set-timer-error")) {
      toast.error("Failed to set timer", {
        toastId: "set-timer-error",
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
    }
  }, [timerPostError]);

  // Helpers Post Error
  useEffect(() => {
    if (helpersPostError && !toast.isActive("send-helpers-error")) {
      toast.error("Failed to send helpers", {
        toastId: "send-helpers-error",
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
    }
  }, [helpersPostError]);

  // Countdown Error
  useEffect(() => {
    if (countdownError && !toast.isActive("countdown-error")) {
      toast.error("Failed to fetch countdown", {
        toastId: "countdown-error",
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
    }
  }, [countdownError]);

  // Timer Get Error
  useEffect(() => {
    if (timerGetError && !toast.isActive("timer-error")) {
      toast.error("Failed to fetch timer value", {
        toastId: "timer-error",
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
    }
  }, [timerGetError]);

  // Helpers Get Error
  useEffect(() => {
    if (helpersGetError && !toast.isActive("helpers-error")) {
      toast.error("Failed to fetch helpers value", {
        toastId: "helpers-error",
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
      });
    }
  }, [helpersGetError]);

  return (
    <div className="flex justify-evenly">
      <div className="border p-3 w-full space-y-2">
        <div className="flex justify-center space-x-5">
          {/* Timer Input */}
          <div>
            <span className="text-xl mr-4 mb-3">Timer (mins): </span>
            <input
              className="border-2 border-[#ff8c8c] rounded-sm outline-none p-1"
              type="number"
              name="timer"
              id="timer"
              value={timer}
              onChange={(e) => setTimer(Number(e.target.value))} // Update timer state in Zustand
              disabled={timerLoading}
            />
          </div>
          {/* Set Timer Button */}
          <button
            className="px-3 py-1 bg-[#ff8c8c] hover:bg-[#e96868] rounded-md text-white"
            onClick={handleSetTimer}
            disabled={loadingTimer} // Disable button while posting
          >
            {loadingTimer ? (
              <>
                Sending{" "}
                <Spinner
                  spinColor="white"
                  backgroundColor="transparent"
                  width="20"
                  height="20"
                />
              </>
            ) : (
              "Set Timer"
            )}
          </button>

          {/* Helpers Input */}
          <div>
            <span className="text-xl mr-4 mb-3">Helpers: </span>
            <input
              className="border-2 border-[#ff8c8c] rounded-sm outline-none p-1"
              type="number"
              name="helpers"
              id="helpers"
              value={helpers}
              onChange={(e) => setHelpers(Number(e.target.value))} // Update helpers state in Zustand
              disabled={helpersLoading}
            />
          </div>
          {/* Send Helpers Button */}
          <button
            className="px-3 py-1 bg-[#ff8c8c] hover:bg-[#e96868] rounded-md text-white"
            onClick={handleSendHelpers}
            disabled={loadingHelpers} // Disable button while posting
          >
            {loadingHelpers ? (
              <>
                Sending{" "}
                <Spinner
                  spinColor="white"
                  backgroundColor="transparent"
                  width="20"
                  height="20"
                />
              </>
            ) : (
              "Send Helpers"
            )}
          </button>
        </div>
        {/* Countdown Timer Display */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-xl font-semibold">
            Countdown Timer :
            <span className="ml-1 text-xl font-bold text-[#ff8c8c]">
              {countdownLoading ? (
                <Spinner spinColor="#ff8c8c" backgroundColor="transparent" />
              ) : (
                countdown + " minutes"
              )}{" "}
            </span>
          </div>
        </div>
        {/* {JSON.stringify(currentCountersList)} */}
        {/* Status:{orderStatusMessage ? orderStatusMessage : "No orders status set"} */}
        {/* Error Messages */}
      </div>
    </div>
  );
}

export default CounterSettings;
