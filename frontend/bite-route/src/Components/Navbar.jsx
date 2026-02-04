import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCartCount } from "../pages/cartService";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function Navbar() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const [cartCount, setCartCount] = useState(0);
  const [hotelCount, setHotelCount] = useState(0);

  useEffect(() => {
    const fetchHotelCount = async () => {
      try {
        if (role === "hotel" && user?.id) {
          const res = await api.get("/api/hotel/count/");
          setHotelCount(res.data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching hotel count:", error);
        setHotelCount(0);
      }
    };

    // 🛒 USER CART COUNT
    setCartCount(getCartCount());

    const handleCartUpdate = () => {
      setCartCount(getCartCount());
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("hotelUpdated", fetchHotelCount);

    // 🏨 HOTEL OWNER HOTEL COUNT
    fetchHotelCount();

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("hotelUpdated", fetchHotelCount);
    };
  }, [user, role, api]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ FIXED USER NAME LOGIC
  const getUserName = () => {
    if (!user) return "";
    if (role === "user") return user?.name || "User";
    if (role === "hotel") return user?.username || "Hotel Owner";
    if (role === "admin") return "Admin";
    return "";
  };

  const roleLabel =
    role === "user"
      ? "User"
      : role === "hotel"
        ? "Hotel Owner"
        : role === "admin"
          ? "Admin"
          : "";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-3">
      <Link className="navbar-brand fw-bold" to="/home">
        🍴 BiteRoute
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">

          {/* HOME */}
          {user && (
            <li className="nav-item">
              <Link className="nav-link" to="/home">
                Home
              </Link>
            </li>
          )}

          {/* USER CART */}
          {role === "user" && (
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                🛒 Cart
                {cartCount > 0 && (
                  <span className="badge bg-danger ms-2">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
          )}

          {/* HOTEL OWNER */}
          {role === "hotel" && (
            <li className="nav-item">
              <Link className="nav-link" to="/hoteldata">
                🏨 My Hotels
                <span className="badge bg-warning text-dark ms-2">
                  {hotelCount}
                </span>
              </Link>
            </li>
          )}

          {/* ADMIN */}
          {role === "admin" && (
            <li className="nav-item">
              <Link className="nav-link" to="/admin-dashboard">
                Admin Dashboard
              </Link>
            </li>
          )}

          {/* USER INFO */}
          {user && (
            <li className="nav-item">
              <span className="nav-link text-white">
                👤 {getUserName()}
                <span className="badge bg-secondary ms-2">
                  {roleLabel}
                </span>
              </span>
            </li>
          )}

          {/* LOGIN / REGISTER */}
          {!user && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/common-register">
                  Register
                </Link>
              </li>
            </>
          )}

          {/* LOGOUT */}
          {user && (
            <li className="nav-item">
              <button
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          )}

        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
