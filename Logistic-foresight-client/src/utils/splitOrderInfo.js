export const splitOrderInfo = (orderInfo) => {
  const [currentOrders, currentOrderItems] = orderInfo.split('-').map(Number);
  return { currentOrders, currentOrderItems };
};
