const createCounterSlice = (set) => ({
  timer: 5,
  helpers: 2,
  countdown: 0,
  //   isTimerRunning: false,
  timerIntervalId: null,
  currentCounters: 0, // Store current running counters
  futureCounters: 0, // Store future counters
  currentOrders: 0, // Store current orders
  currentOrderItems: 0, // Store current order items
  orderStatusMessage: "",

  currentOrdersList: [], // List for current orders
  currentCountersList: [], // List for current counters
  futureCountersList: [], // List for future counters

  setTimer: (timer) => set({ timer }),
  setHelpers: (helpers) => set({ helpers }),
  setCountdown: (countdown) => set({ countdown }),
  setIsTimerRunning: (isTimerRunning) => set({ isTimerRunning }),
  setTimerIntervalId: (timerIntervalId) => set({ timerIntervalId }),
  setCurrentCounters: (counters) => set({ currentCounters: counters }),
  setFutureCounters: (counters) => set({ futureCounters: counters }),
  setCurrentOrders: (orders) => set({ currentOrders: orders }),
  setCurrentOrderItems: (items) => set({ currentOrderItems: items }),

  setCurrentOrdersList: (list) => set({ currentOrdersList: list }), // List for current orders
  setCurrentCountersList: (list) => set({ currentCountersList: list }), // List for current counters
  setFutureCountersList: (list) => set({ futureCountersList: list }) // List for future counters
});

export default createCounterSlice;
