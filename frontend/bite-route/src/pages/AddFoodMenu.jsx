import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Login.css";
import type from "../data/type"; // ✅ your array
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AddFoodMenu() {
  const location = useLocation();
  const [hotelName, setHotelName] = useState("");
  const [approved, setApproved] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [category, setCategory] = useState("");

  const [foodName, setFoodName] = useState("");
  const [price, setPrice] = useState("");
  const [foodDesc, setFoodDesc] = useState("");

  const [message, setMessage] = useState("");
  const [myHotels, setMyHotels] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    if (location.state?.hotelName) {
      setHotelName(location.state.hotelName);
      // Removed manual setApproved(true) to avoid bypassing backend check
    }
  }, [location.state]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchMyHotels = async () => {
      try {
        const res = await api.get("/api/hotel/my-hotels/");
        setMyHotels(res.data);
      } catch (err) {
        console.error("Failed to fetch my hotels", err);
      }
    };

    fetchMyHotels();
  }, [user]);

  const checkHotelStatus = async (manualName = null) => {
    const nameToQuery = typeof manualName === 'string' ? manualName : hotelName;

    setMessage("");
    setApproved(null);
    setStatusMsg("");
    setShowForm(false);

    if (!nameToQuery.trim()) {
      setMessage("Please enter hotel name");
      return;
    }

    try {
      const res = await api.get('/api/hotels/check-status/', {
        params: { hotel_name: nameToQuery.trim() }
      });

      const backendMsg = res.data.message || "Status updated";

      if (res.data.status === "approved") {
        setApproved(true);
        setStatusMsg(backendMsg.includes('✅') ? backendMsg : `✅ ${backendMsg}`);
      } else if (res.data.status === "pending") {
        setApproved(false);
        setStatusMsg(backendMsg.includes('⏳') ? backendMsg : `⏳ ${backendMsg}`);
      } else if (res.data.status === "rejected") {
        setApproved(false);
        setStatusMsg(backendMsg.includes('❌') ? backendMsg : `❌ ${backendMsg}`);
      } else {
        setApproved(false);
        setStatusMsg(`❌ ${backendMsg}`);
      }

    } catch (err) {
      setApproved(false);
      const errMsg = err.response?.data?.message || "Hotel not found. Please register first.";
      setStatusMsg(errMsg.includes('❌') ? errMsg : `❌ ${errMsg}`);
    }
  };

  const addFoodItem = async () => {
    setMessage("");

    if (!category || !foodName.trim() || !price.trim()) {
      setMessage("Please fill all required fields");
      return;
    }

    try {
      await api.post("/api/foods/add/", {
        hotel_name: hotelName,
        category: category,
        food_name: foodName,
        price: price,
        description: foodDesc,
      });

      setMessage("✅ Food added successfully!");
      setFoodName("");
      setPrice("");
      setFoodDesc("");
      setCategory("");

    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add food");
    }
  };


  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow border-0" style={{ maxWidth: "600px", width: "100%", borderRadius: "15px" }}>
        <div className="card-header bg-success text-white text-center py-4" style={{ borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}>
          <h3 className="fw-bold mb-0">🍽️ Chcek your hotel Status</h3>
          <p className="small mb-0 opacity-75">Expand your menu and reach more customers</p>
        </div>

        <div className="card-body p-4">
          {message && (
            <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} text-center py-2 mb-4`} role="alert">
              {message}
            </div>
          )}

          {/* Section 1: Hotel Selection */}
          <div className="mb-4">
            <label className="form-label fw-bold text-muted small text-uppercase">1. Identify Your Hotel</label>
            <div className="mb-3">
              <div className="d-flex align-items-center bg-white border rounded px-2">
                <span className="me-2">🏨</span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none ps-0"
                  placeholder="Enter your Hotel Name"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  onBlur={() => checkHotelStatus()}
                />
              </div>
            </div>

            {myHotels.length > 0 && (
              <div className="mb-3">
                <p className="small text-muted mb-2">Or select from your registered hotels:</p>
                <div className="d-flex flex-wrap gap-2">
                  {myHotels.map((hotel) => (
                    <button
                      key={hotel.id}
                      className={`btn btn-sm ${hotelName === hotel.hotel_name ? 'btn-success' : 'btn-outline-secondary'}`}
                      style={{ borderRadius: "20px" }}
                      onClick={() => {
                        setHotelName(hotel.hotel_name);
                        checkHotelStatus(hotel.hotel_name); // Trigger check immediately
                      }}
                    >
                      {hotel.hotel_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {statusMsg && (
              <div className={`p-2 rounded text-center small fw-medium ${statusMsg.includes('✅') ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-dark'}`}>
                {statusMsg}
                {approved === true && !showForm && (
                  <div className="mt-2">
                    <button
                      className="btn btn-sm btn-success fw-bold"
                      onClick={() => setShowForm(true)}
                    >
                      ➕ Add Food Menu
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Food Details */}
          {approved === true && showForm && (
            <div className="animate__animated animate__fadeIn">
              <hr className="my-4 text-muted opacity-25" />
              <label className="form-label fw-bold text-muted small text-uppercase">2. Food Item Details</label>

              <div className="mb-3">
                <label className="small fw-bold mb-1">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Choose Category --</option>
                  {type.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-8">
                  <label className="small fw-bold mb-1">Food Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Special Masala Dosa"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="small fw-bold mb-1">Description (Optional)</label>
                <textarea
                  className="form-control"
                  placeholder="Tell customers about this dish..."
                  rows="3"
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                ></textarea>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-dark py-2 fw-bold"
                  onClick={addFoodItem}
                  type="button"
                  style={{ borderRadius: "10px" }}
                >
                  🚀 Add to Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
