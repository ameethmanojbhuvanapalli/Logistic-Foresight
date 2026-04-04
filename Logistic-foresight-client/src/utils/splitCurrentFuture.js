export const splitCurrentFuture = (orderInfo) => {
    const [currentCounters, futureCounters] = orderInfo.split('-').map(Number);
    return { currentCounters, futureCounters };
  };
  
//splits counters