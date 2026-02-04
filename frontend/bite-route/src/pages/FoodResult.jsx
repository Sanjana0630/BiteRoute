import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dispatchCartUpdate } from "./cartService";
import api from "../api/axios";

export default function FoodResults() {
  const locationData = useLocation();
  const navigate = useNavigate();

  const { type, food, location } = locationData.state || {};

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!type || !food || !location) {
      navigate("/home");
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/user/search-food/", {
          params: { type, food, location }
        });

        const data = res.data;
        setResults(data);
      } catch (err) {
        setResults([]);
      }
      setLoading(false);
    };

    fetchResults();
  }, [type, food, location, navigate]);

  // 🛒 Add to Cart
  const addToCart = (item) => {
    const cartKey = "cart_guest";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const existingItem = cart.find(
      (c) => c.food_id === item.food_id
    );

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({
        food_id: item.food_id,
        hotel_name: item.hotel_name,
        food_name: item.food_name,
        location: item.location,
        price: item.price,
        qty: 1,
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));

    // ✅ Dispatch Update
    dispatchCartUpdate();

    // show choice popup
    setShowPopup(true);
  };

  return (
    <>
      <div className="container py-5">
        <h3 className="fw-bold text-center mb-3">
          Results for "{food}"
        </h3>

        {loading && (
          <p className="text-center text-muted">
            Searching hotels...
          </p>
        )}

        {!loading && results.length === 0 && (
          <p className="text-center text-muted">
            No food found 😢
          </p>
        )}

        <div className="row g-4">
          {results.map((item, index) => (
            <div key={index} className="col-md-4">
              <div className="card shadow-sm p-3 h-100">
                <h5 className="fw-bold">{item.food_name}</h5>
                <p className="text-muted mb-1">
                  🏨 {item.hotel_name}
                </p>
                <p className="text-muted mb-1">
                  📍 {item.location}
                </p>
                <p className="fw-bold text-success">
                  ₹ {item.price}
                </p>

                <button
                  className="btn btn-dark w-100"
                  onClick={() => addToCart(item)}
                >
                  ➕ Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ ADD-TO-CART POPUP */}
      {showPopup && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center">
              <h5 className="text-success mb-3">
                ✅ Item added to cart
              </h5>

              <div className="d-flex justify-content-between gap-2">
                <button
                  className="btn btn-outline-success w-100"
                  onClick={() => {
                    setShowPopup(false);
                    navigate("/home"); // add another item
                  }}
                >
                  ➕ Add Another Item
                </button>

                <button
                  className="btn btn-success w-100"
                  onClick={() => {
                    setShowPopup(false);
                    navigate("/cart");
                  }}
                >
                  🛒 Go to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
