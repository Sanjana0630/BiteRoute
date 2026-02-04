import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Login.css";


function CommonLogin() {
  // const [role, setRole] = useState("user"); // user | hotel | admin  <-- REMOVED
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");

    if (!contact || !password) {
      setError("All fields are required");
      return;
    }

    try {
      // 🔥 UNIFIED LOGIN ENDPOINT
      const response = await api.post("/api/common/login/", {
        contact: contact.trim(),
        password: password.trim()
      });
      const data = response.data;

      const token = data.token; // Might be null for admin, handle accordingly
      const detectedRole = data.role; // "user" | "hotel" | "admin"

      // ✅ NORMALIZED STORAGE
      let userData = null;

      if (detectedRole === "user") {
        userData = data.user;        // { id, name, contact }
      }

      if (detectedRole === "hotel") {
        userData = data.owner;      // { id, username, contact }
      }

      if (detectedRole === "admin") {
        userData = data.user; // Admin user object
      }

      // Use context login
      login(userData, token, detectedRole);

      // 🚀 Redirect based on DETECTED ROLE
      if (detectedRole === "user") navigate("/home");
      if (detectedRole === "hotel") navigate("/hoteldashboard");
      if (detectedRole === "admin") navigate("/admin-dashboard");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="user-login-page">
      <div className="user-login-box">
        <h3 className="mb-2">Login</h3>
        <p className="text-muted mb-3">
          Enter your credentials to login
        </p>

        {error && <p className="text-danger small">{error}</p>}

        {/* ROLE SELECTION REMOVED */}

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          className="btn btn-success w-100"
          onClick={handleLogin}
        >
          Login
        </button>

        <p className="text-muted small mt-3">
          New here?{" "}
          <span
            className="register-link"
            onClick={() => navigate("/common-register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default CommonLogin;
