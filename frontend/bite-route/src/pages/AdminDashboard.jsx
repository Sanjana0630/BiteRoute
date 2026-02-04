import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const [hotels, setHotels] = useState([]);
  const [activeTab, setActiveTab] = useState(""); // pending | approved | rejected | total
  const [message, setMessage] = useState("");

  const { user } = useAuth();

  // ✅ Fetch counts
  const fetchCounts = async () => {
    try {
      const res = await api.get("/api/admin/dashboard-counts/");
      setCounts(res.data);
    } catch (err) {
      console.log("Counts fetch error");
    }
  };

  // ✅ Fetch list based on card click
  const fetchHotels = async (tab) => {
    setMessage("");
    setHotels([]);
    setActiveTab(tab);

    let url = "";

    if (tab === "pending") url = "/api/admin/pending-hotels/";
    if (tab === "approved") url = "/api/admin/approved-hotels/";
    if (tab === "rejected") url = "/api/admin/rejected-hotels/";
    if (tab === "total") url = "/api/admin/all-hotels/";

    try {
      const res = await api.get(url);
      setHotels(res.data);
    } catch (err) {
      console.log("Hotel fetch error");
    }
  };

  // ✅ Approve
  const approveHotel = async (id) => {
    try {
      const res = await api.post("/api/admin/approve-hotel/", { hotel_id: id });
      setMessage(res.data.message);

      fetchCounts();
      fetchHotels(activeTab);
    } catch (err) {
      setMessage("Server error ❌");
    }
  };

  // ✅ Reject
  const rejectHotel = async (id) => {
    try {
      const res = await api.post("/api/admin/reject-hotel/", { hotel_id: id });
      setMessage(res.data.message);

      fetchCounts();
      fetchHotels(activeTab);
    } catch (err) {
      setMessage("Server error ❌");
    }
  };

  // ✅ Delete
  const deleteHotel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const res = await api.post("/api/admin/delete-hotel/", { hotel_id: id });
      setMessage(res.data.message);

      fetchCounts();
      fetchHotels(activeTab);
    } catch (err) {
      setMessage("Server error ❌");
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="container py-5">
      <h3 className="fw-bold text-center mb-4">Admin Dashboard 🛡️</h3>

      {/* ✅ COUNTS ONLY */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div
            className="card shadow-sm p-3 text-center admin-card"
            style={{ cursor: "pointer" }}
            onClick={() => fetchHotels("total")}
          >
            <h6 className="text-muted">Total Hotels</h6>
            <h3 className="fw-bold">{counts.total}</h3>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card shadow-sm p-3 text-center admin-card"
            style={{ cursor: "pointer" }}
            onClick={() => fetchHotels("approved")}
          >
            <h6 className="text-muted">Approved</h6>
            <h3 className="fw-bold text-success">{counts.approved}</h3>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card shadow-sm p-3 text-center admin-card"
            style={{ cursor: "pointer" }}
            onClick={() => fetchHotels("pending")}
          >
            <h6 className="text-muted">Pending</h6>
            <h3 className="fw-bold text-warning">{counts.pending}</h3>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="card shadow-sm p-3 text-center admin-card"
            style={{ cursor: "pointer" }}
            onClick={() => fetchHotels("rejected")}
          >
            <h6 className="text-muted">Rejected</h6>
            <h3 className="fw-bold text-danger">{counts.rejected}</h3>
          </div>
        </div>
      </div>

      {/* ✅ Message */}
      {message && (
        <p className="text-center fw-medium text-success">{message}</p>
      )}

      {/* ✅ HOTEL LIST AFTER CLICK */}
      {activeTab && (
        <>
          <h5 className="fw-bold text-center mb-4">
            {activeTab.toUpperCase()} Hotels
          </h5>

          {hotels.length === 0 ? (
            <p className="text-center text-muted">No hotels found</p>
          ) : (
            <div className="row">
              {hotels.map((hotel) => (
                <div className="col-12 col-md-6 col-lg-4 mb-4" key={hotel.id}>
                  <div className="card p-3 shadow-sm h-100">
                    <h5 className="fw-bold">{hotel.hotel_name}</h5>
                    <p className="text-muted small mb-1">📍 {hotel.location}</p>
                    <p className="text-muted small mb-2">
                      🍽️ {hotel.food_type}
                    </p>

                    {/* ✅ Pending actions */}
                    {activeTab === "pending" && (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm w-50"
                          onClick={() => approveHotel(hotel.id)}
                        >
                          Approve ✅
                        </button>

                        <button
                          className="btn btn-danger btn-sm w-50"
                          onClick={() => rejectHotel(hotel.id)}
                        >
                          Reject ❌
                        </button>
                      </div>
                    )}

                    {/* ✅ Approved → Delete */}
                    {activeTab === "approved" && (
                      <button
                        className="btn btn-dark btn-sm w-100"
                        onClick={() => deleteHotel(hotel.id)}
                      >
                        Delete 🗑️
                      </button>
                    )}

                    {/* ✅ Rejected → Approve or Delete */}
                    {activeTab === "rejected" && (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm w-50"
                          onClick={() => approveHotel(hotel.id)}
                        >
                          Approve ✅
                        </button>
                        <button
                          className="btn btn-dark btn-sm w-50"
                          onClick={() => deleteHotel(hotel.id)}
                        >
                          Delete 🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
