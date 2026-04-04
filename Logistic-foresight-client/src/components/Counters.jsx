// import { useEffect } from "react";
import useStore from "../store"; // Ensure this is the correct path to your Zustand store
// import useGet from "../hooks/useGet"; // Ensure this is the correct path to your custom hook

function Counters() {
  const {
    timer,
    helpers,
    currentCounters,
    futureCounters,
    currentOrders,
    currentOrderItems,
    currentOrdersList,
    currentCountersList,
    futureCountersList,
    orderStatusMessage,

    setCurrentCounters,
    setFutureCounters,
    setCurrentOrders,
    setCurrentOrderItems
  } = useStore();

  return (
    <div className="flex justify-evenly">
      {/* Orders */}
      <div className="w-2/5 h-[150px] border rounded flex flex-col p-3 text-gray-600 hover:border-[#ff8c8c] transition-colors">
        <h3 className="text-xl font-semibold">
          Current Orders: {(currentOrders<=0 || currentOrderItems<= 0)?0:currentOrders} (
          {Math.max(currentOrderItems, 0)})
        </h3>
        <div
          className={`counters-container flex flex-wrap ${
            currentOrders > 0 ? "flex-row-reverse" : "flex-row"
          } border p-1`}>
          {/* Dynamically rendered */}
          {(currentOrders>0 && currentOrderItems> 0) ? (
            Array.from({ length: Math.min(currentOrders, 12) }).map(
              (_, index) => (
                <div
                  key={index}
                  className="p-3 mt-1 mb-1 mx-1 bg-indigo-400 text-white">
                  O
                </div>
              )
            )
          ) : (
            <div className="p-3 mt-1 mb-1 mx-1 text-red-500 flex-end">
              No Active orders
            </div>
          )}
        </div>
        <div className="text-green-500">{orderStatusMessage}</div>
      </div>

      {/* Current running counters */}
      <div className="w-2/5 h-[150px] border rounded flex flex-col p-4 text-gray-600 hover:border-[#ff8c8c] transition-colors">
        <h3 className="text-xl font-semibold">
          Current Running Counters: {currentCounters}
        </h3>
        <div className="counters-container flex flex-wrap space-x-3 border p-1">
          {currentCountersList.length > 0 ? (
            currentCountersList.map((counter) => (
              <div
                key={counter.id}
                className={`p-3 mt-1 mb-1 mx-1 ${
                  counter.isActive ? "bg-green-400" : "bg-red-400"
                } text-white`}>
                C{counter.id}
                {/* <div>{"IS ACTIVE: " + counter.isActive}</div> */}
              </div>
            ))
          ) : (
            <div className="p-3 mt-1 mb-1 mx-1 text-red-500">
              No current counters are available
            </div>
          )}
        </div>
      </div>

      {/* Future Counters (fetches info every 1hr, shows No-Counters if not available) */}
      <div className="w-2/5 h-[150px] border rounded flex flex-col p-4 text-gray-600 hover:border-[#ff8c8c] transition-colors">
        <h3 className="text-xl font-semibold">
          Future Counters: {futureCounters}
        </h3>
        <div className="counters-container flex flex-wrap space-x-3 border p-1">
          {/* Dynamically rendered */}
          {futureCounters > 0 ? (
            Array.from({ length: futureCounters }).map((_, index) => (
              <div
                key={index}
                className="p-3 mt-1 mb-1 mx-1 bg-gray-400 text-white">
                C{index + 1}
              </div>
            ))
          ) : (
            <div className="p-3 mt-1 mb-1 mx-1 text-red-500">
              No future counters are required.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Counters;
