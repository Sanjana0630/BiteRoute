import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function HotelData() {
  const [hotels, setHotels] = useState([]);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || role !== "hotel") return;

    const fetchHotels = async () => {
      try {
        const res = await api.get("/api/hotel/my-hotels/");
        setHotels(res.data);
      } catch (err) {
        console.error("Failed to fetch hotels", err);
      }
    };

    fetchHotels();
  }, [user, role]);

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4">🏨 My Registered Hotels</h3>

      {hotels.length === 0 ? (
        <p className="text-muted">
          You have not registered any hotels yet.
        </p>
      ) : (
        <div className="row g-4">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="col-md-4">
              <div className="card shadow-sm p-3 h-100">
                <h5 className="fw-bold">{hotel.hotel_name}</h5>
                <p className="text-muted mb-1">
                  📍 {hotel.location}
                </p>
                <p className="small mb-3">
                  🍽️ {hotel.food_type}
                </p>

                <div className="mb-3">
                  {hotel.approved ? (
                    <span className="badge bg-success">✅ Approved</span>
                  ) : hotel.rejected ? (
                    <span className="badge bg-danger">❌ Hotel rejected by admin</span>
                  ) : (
                    <span className="badge bg-warning text-dark">⏳ Pending</span>
                  )}
                </div>

                <button
                  className={`btn btn-sm mt-auto ${hotel.approved ? 'btn-success' : 'btn-secondary disabled'}`}
                  onClick={() => hotel.approved && navigate(`/manage-hotel/${hotel.id}`)}
                >
                  {hotel.approved ? "Manage Hotel" : "Awaiting Approval"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
