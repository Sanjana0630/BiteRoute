import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function HotelDetails() {
  const [hotelName, setHotelName] = useState("");
  const [location, setLocation] = useState("");
  const [foodTypes, setFoodTypes] = useState([]);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // ✅ GET LOGGED-IN HOTEL OWNER
  const { user } = useAuth();

  const foodOptions = [
    "South Indian",
    "Punjabi",
    "Maharashtrian",
    "Gujarati",
    "Chinese",
    "Italian",
    "Street Food",
  ];

  const handleFoodTypeChange = (type) => {
    if (foodTypes.includes(type)) {
      setFoodTypes(foodTypes.filter((item) => item !== type));
    } else {
      setFoodTypes([...foodTypes, type]);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (
      !hotelName ||
      !location ||
      foodTypes.length === 0 ||
      !openTime ||
      !closeTime
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      await api.post("/api/hotels/details/", {
        hotel_name: hotelName,
        location: location,
        food_type: foodTypes.join(","),
        open_time: openTime,
        close_time: closeTime,
        description: description,
      });

      setSuccess("Hotel details saved successfully 🏨");
      window.dispatchEvent(new Event("hotelUpdated"));

      setHotelName("");
      setLocation("");
      setFoodTypes([]);
      setOpenTime("");
      setCloseTime("");
      setDescription("");

      setTimeout(() => {
        navigate("/hoteldashboard");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="register-page" style={{ height: "auto", minHeight: "100vh" }}>
      <div className="register-box">
        <h3 className="fw-bold mb-2">Hotel Details 🏨</h3>
        <p className="text-muted mb-4">
          Add complete information about your hotel
        </p>

        {error && <p className="text-danger small">{error}</p>}
        {success && <p className="text-success small">{success}</p>}

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Hotel Name"
          value={hotelName}
          onChange={(e) => setHotelName(e.target.value)}
        />

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Location (City / Area)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="mb-3 text-start">
          <label className="fw-medium mb-2">
            Food Types Available
          </label>

          <div className="row">
            {foodOptions.map((type, index) => (
              <div className="col-6 mb-2" key={index}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={foodTypes.includes(type)}
                    onChange={() => handleFoodTypeChange(type)}
                  />
                  <label className="form-check-label">
                    {type}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <input
          type="time"
          className="form-control mb-3"
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
        />

        <input
          type="time"
          className="form-control mb-3"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
        />

        <textarea
          className="form-control mb-4"
          placeholder="Hotel Description (optional)"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          className="btn btn-success w-100"
          onClick={handleSubmit}
        >
          Save Hotel Details
        </button>
      </div>
    </div>
  );
}
