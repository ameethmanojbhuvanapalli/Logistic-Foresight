export const splitCounterStatus = (message) => {
  // Split the message into order items and counter info
  let [currentOrderItems, counterInfo] = message.split("-");

  // Split the counterInfo by spaces
  let parts = counterInfo.split(" ");

  // Extract the counter ID by removing 'Counter' and converting to a number
  let counterID = Number(parts[1]); // parts[1] should be '3' in "Counter 3 is free"

  // Extract the status from the last part of the parts array
  let counterIDStatus = parts[3]; // parts[3] should be 'free' in "Counter 3 is free"

  // Convert currentOrderItems to a number
  currentOrderItems = Number(currentOrderItems);

  return { currentOrderItems, counterID, counterIDStatus };
};

// Example usage
//   const result = splitCounterStatus("10-Counter 3 is busy");
//   console.log(result); // Should output: { currentOrderItems: 10, counterID: 3, counterIDStatus: 'free' }
