import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HotelDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="container py-5">
      {/* Welcome Section */}
      <div className="text-center mb-5">
        <h2 className="fw-bold">
          Welcome to BiteRoute, Hotel Partner 🏨
        </h2>
        <p className="text-muted mt-2">
          Manage your hotel, food menu, and reach nearby customers easily
        </p>
      </div>

      {/* About BiteRoute */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-10">
          <div className="card p-4 shadow-sm">
            <h5 className="fw-bold mb-2">About BiteRoute 🍴</h5>
            <p className="text-muted mb-0">
              BiteRoute helps customers discover nearby food based on
              location and food type. As a hotel partner, you can register
              your hotel, list your food items, and attract more customers
              from your area.
            </p>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="row justify-content-center g-4 mt-3">
        {/* Register Hotel */}
        <div className="col-md-4 col-sm-6">
          <div className="card p-4 shadow-sm text-center h-100">
            <h5 className="fw-bold mb-2">🏨 Register Your Hotel</h5>
            <p className="text-muted small mb-3">
              Add hotel name, location, and food type
            </p>
            <button
              className="btn btn-success"
              onClick={() => navigate("/hotel-details")}
            >
              Register Hotel
            </button>
          </div>
        </div>

        {/* Add Food */}
        <div className="col-md-4 col-sm-6">
          <div className="card p-4 shadow-sm text-center h-100">
            <h5 className="fw-bold mb-2">🍽️ Check status</h5>
            <p className="text-muted small mb-3">
              Add food items with price (available after hotel registration)
            </p>
            <button
              className="btn btn-success"
              onClick={() => navigate("/add-food")}
            >
              Check Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
