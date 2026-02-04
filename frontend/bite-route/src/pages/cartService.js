
// Simple cart service to manage local storage cart

export const getCartCount = () => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart_guest")) || [];
    return cart.reduce((acc, item) => acc + item.qty, 0);
  } catch (e) {
    return 0;
  }
};

export const dispatchCartUpdate = () => {
  window.dispatchEvent(new Event("cartUpdated"));
};
