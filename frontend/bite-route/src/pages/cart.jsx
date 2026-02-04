import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dispatchCartUpdate } from "./cartService";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const cartKey = "cart_guest";

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    setCartItems(cart);
  };

  const saveCart = (cart) => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setCartItems(cart);
    dispatchCartUpdate();
  };

  useEffect(() => {
    loadCart();
  }, []);

  const increaseQty = (food_id) => {
    const updated = cartItems.map((item) =>
      item.food_id === food_id
        ? { ...item, qty: item.qty + 1 }
        : item
    );
    saveCart(updated);
  };

  const decreaseQty = (food_id) => {
    const updated = cartItems
      .map((item) =>
        item.food_id === food_id
          ? { ...item, qty: item.qty - 1 }
          : item
      )
      .filter((item) => item.qty > 0);

    saveCart(updated);
  };

  const removeItem = (food_id) => {
    const updated = cartItems.filter(
      (item) => item.food_id !== food_id
    );
    saveCart(updated);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <>
      <div className="container py-5">
        <h3 className="fw-bold text-center mb-4">
          🛒 Your Cart
        </h3>

        {cartItems.length === 0 ? (
          <p className="text-center text-muted">
            Cart is empty 😢
          </p>
        ) : (
          <>
            <div className="row g-4">
              {cartItems.map((item) => (
                <div
                  key={item.food_id}
                  className="col-md-4"
                >
                  <div className="card shadow-sm p-3 h-100">
                    <h5 className="fw-bold">
                      {item.food_name}
                    </h5>
                    <p className="text-muted mb-1">
                      🏨 {item.hotel_name}
                    </p>

                    <p className="fw-bold text-success">
                      ₹ {item.price} × {item.qty} =
                      ₹ {item.price * item.qty}
                    </p>

                    <div className="d-flex justify-content-between">
                      <div>
                        <button
                          className="btn btn-dark btn-sm"
                          onClick={() =>
                            decreaseQty(item.food_id)
                          }
                        >
                          −
                        </button>

                        <span className="mx-2 fw-bold">
                          {item.qty}
                        </span>

                        <button
                          className="btn btn-dark btn-sm"
                          onClick={() =>
                            increaseQty(item.food_id)
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() =>
                          removeItem(item.food_id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              <h5 className="fw-bold">
                Total: ₹ {totalPrice}
              </h5>

              <button
                className="btn btn-success mt-2 px-4"
                onClick={() => navigate("/checkout")}
              >
                Checkout ✅
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
