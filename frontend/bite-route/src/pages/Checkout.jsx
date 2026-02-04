import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { dispatchCartUpdate } from "./cartService";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cartKey = "cart_guest";

  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // 👤 Delivery details
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  // 📍 Address
  const [houseNo, setHouseNo] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // 🔥 UI states
  const [showQR, setShowQR] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  // 🔁 Load cart
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    if (cart.length === 0) {
      navigate("/cart");
    } else {
      setCartItems(cart);
    }
  }, [navigate]);

  // 💰 PRICE CALCULATION
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const gstAmount = subtotal * 0.05; // 5% GST
  const totalAmount = subtotal + gstAmount;

  // 🔗 Dynamic UPI QR
  const upiQRValue = `upi://pay?pa=biteroute@upi&pn=BiteRoute&am=${totalAmount.toFixed(
    2
  )}&cu=INR`;

  // 🔥 ONLINE PAYMENT (dummy)
  const startOnlinePayment = async (orderData) => {
    try {
      await api.post("/api/cashfree/create-order/", { amount: totalAmount.toFixed(2) });

      await api.post("/api/send-receipt/", orderData);
      await api.post("/api/orders/place/", orderData); // ✅ Save to DB

      localStorage.removeItem(cartKey);
      dispatchCartUpdate();
      setShowPopup(true);
    } catch (err) {
      console.error(err);
      alert("Online payment failed");
    }
  };

  // ⏱ QR → AUTO SUCCESS
  const confirmPayment = () => {
    if (!pendingOrder) return;

    setProcessing(true);

    // simulate small processing delay
    setTimeout(() => {
      setShowQR(false);
      setProcessing(false);
      setShowPopup(true);

      // backend + email (dummy)
      startOnlinePayment(pendingOrder);
      setPendingOrder(null);
    }, 1000);
  };

  // ✅ Place Order
  const placeOrder = () => {
    if (!name || !mobile || !houseNo || !area || !city || !pincode) {
      alert("❗ Please fill all delivery details");
      return;
    }

    if (!user?.id) {
      navigate("/login");
      return;
    }

    const fullAddress = `
House No: ${houseNo},
Area: ${area},
Landmark: ${landmark || "N/A"},
City: ${city},
Pincode: ${pincode}
`;

    const orderData = {
      user_id: user.id,
      name,
      mobile,
      address: fullAddress,
      payment_method:
        paymentMethod === "cod"
          ? "Cash on Delivery"
          : "Online Payment",
      subtotal: subtotal.toFixed(2),
      gst: gstAmount.toFixed(2),
      total: totalAmount.toFixed(2),
      items: cartItems.map((item) => ({
        food_id: item.food_id,
        name: item.food_name,
        hotel_name: item.hotel_name, // ✅ Include hotel name
        qty: item.qty,
        price: item.price,
      })),
    };

    // 💵 COD
    if (paymentMethod === "cod") {
      api.post("/api/send-receipt/", orderData);
      api.post("/api/orders/place/", orderData); // ✅ Save to DB

      localStorage.removeItem(cartKey);
      dispatchCartUpdate();
      setShowPopup(true);
      return;
    }

    // 💳 ONLINE
    setPendingOrder(orderData);
    setShowQR(true);
  };

  return (
    <>
      <div className="container py-5" style={{ maxWidth: "900px" }}>
        <h3 className="fw-bold text-center mb-4">🧾 Checkout</h3>

        {/* 🧺 ORDER SUMMARY */}
        <div className="card shadow-sm p-4 mb-4">
          <h5 className="fw-bold mb-3">Order Summary</h5>

          {cartItems.map((item) => (
            <div
              key={item.food_id}
              className="mb-3 border-bottom pb-2"
            >
              <div className="small text-muted fw-bold">🏨 {item.hotel_name}</div>
              <div className="d-flex justify-content-between">
                <span>
                  {item.food_name} × {item.qty}
                </span>
                <span>₹ {item.price * item.qty}</span>
              </div>
            </div>
          ))}

          <hr />

          <div className="d-flex justify-content-between">
            <span>Subtotal</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>GST (5%)</span>
            <span>₹ {gstAmount.toFixed(2)}</span>
          </div>

          <hr />

          <div className="d-flex justify-content-between fw-bold">
            <span>Total Payable</span>
            <span className="text-success">
              ₹ {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 🚚 DELIVERY DETAILS */}
        <div className="card shadow-sm p-4 mb-4">
          <h5 className="fw-bold mb-3">Delivery Details</h5>

          <input className="form-control mb-3" placeholder="Full Name"
            value={name} onChange={(e) => setName(e.target.value)} />

          <input className="form-control mb-3" placeholder="Mobile Number"
            maxLength="10" value={mobile}
            onChange={(e) => setMobile(e.target.value)} />

          <input className="form-control mb-3" placeholder="House / Flat No"
            value={houseNo} onChange={(e) => setHouseNo(e.target.value)} />

          <input className="form-control mb-3" placeholder="Street / Area"
            value={area} onChange={(e) => setArea(e.target.value)} />

          <input className="form-control mb-3" placeholder="Landmark (Optional)"
            value={landmark} onChange={(e) => setLandmark(e.target.value)} />

          <input className="form-control mb-3" placeholder="City"
            value={city} onChange={(e) => setCity(e.target.value)} />

          <input className="form-control" placeholder="Pincode" maxLength="6"
            value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>

        {/* 💳 PAYMENT METHOD */}
        <div className="card shadow-sm p-4 mb-4">
          <h5 className="fw-bold mb-3">Payment Method</h5>

          <div className="form-check mb-2">
            <input className="form-check-input" type="radio"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")} />
            <label className="form-check-label">
              💵 Cash on Delivery
            </label>
          </div>

          <div className="form-check">
            <input className="form-check-input" type="radio"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")} />
            <label className="form-check-label">
              💳 Pay Online
            </label>
          </div>
        </div>

        <div className="text-center">
          <button className="btn btn-success px-5" onClick={placeOrder}>
            Place Order ₹{totalAmount.toFixed(2)}
          </button>
        </div>
      </div>

      {showQR && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center">
              <h5 className="fw-bold">Scan & Pay</h5>

              <p className="text-muted">
                Amount: ₹{totalAmount.toFixed(2)} (incl. GST)
              </p>

              {/* Responsive QR */}
              <div className="d-flex justify-content-center my-3">
                <div style={{ width: "100%", maxWidth: "240px" }}>
                  <QRCodeSVG
                    value={upiQRValue}
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              </div>

              <p className="text-muted">
                Scan using GPay / PhonePe / Paytm
              </p>

              {/* ✅ MANUAL CONFIRM BUTTON */}
              <button
                className="btn btn-success w-100 mt-3"
                onClick={confirmPayment}
                disabled={processing}
              >
                {processing ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ✅ SUCCESS POPUP */}
      {showPopup && (
        <div className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center">
              <h4 className="text-success mb-3">
                ✅ Order Placed Successfully
              </h4>
              <p>
                Thank you <b>{name}</b> for ordering with BiteRoute 🍽️
              </p>
              <p className="text-muted">
                Amount Paid: ₹{totalAmount.toFixed(2)} (incl. GST)
              </p>

              <button className="btn btn-success mt-3"
                onClick={() => {
                  setShowPopup(false);
                  navigate("/home");
                }}>
                Go to Home 🏠
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
