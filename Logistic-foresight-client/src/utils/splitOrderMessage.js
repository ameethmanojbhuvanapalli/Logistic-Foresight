export const splitOrderMessage = (orderMessage) => {
  const [currentOrders, toastMessage] = orderMessage.split("-");
  return { currentOrders: Number(currentOrders), toastMessage };
};
