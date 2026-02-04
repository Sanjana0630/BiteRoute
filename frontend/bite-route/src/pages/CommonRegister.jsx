import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function CommonRegister() {
  const [role, setRole] = useState("user"); // user | hotel
  const [name, setName] = useState(""); // full name (user)
  const [username, setUsername] = useState(""); // username (hotel)
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    // ✅ validation
    if (!contact || !password) {
      setError("All fields are required");
      return;
    }

    if (role === "user" && !name) {
      setError("Please enter full name");
      return;
    }

    if (role === "hotel" && !username) {
      setError("Please enter username");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const isPhone = /^\d{10}$/.test(contact);

    if (!isEmail && !isPhone) {
      setError("Enter valid email");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // ✅ API based on role
    let apiUrl = "";
    let payload = {};

    if (role === "user") {
      apiUrl = "http://127.0.0.1:8000/api/users/register/";
      payload = {
        name,
        contact,
        password,
      };
    }

    if (role === "hotel") {
      apiUrl = "http://127.0.0.1:8000/api/hotels/signup/";
      payload = {
        username,
        contact,
        password,
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Registration successful 🎉");

        // clear inputs
        setName("");
        setUsername("");
        setContact("");
        setPassword("");

        // ✅ go to login after success
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setError(data.message || JSON.stringify(data));
      }
    } catch (err) {
      setError("Server not responding");
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <h3 className="fw-bold mb-2">Create Account ✨</h3>
        <p className="text-muted mb-3">
          Select role and create account
        </p>

        {error && <p className="text-danger small">{error}</p>}
        {success && <p className="text-success small">{success}</p>}

        {/* ROLE DROPDOWN */}
        <select
          className="form-control mb-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="hotel">Hotel Owner</option>
        </select>

        {/* USER NAME */}
        {role === "user" && (
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {/* HOTEL USERNAME */}
        {role === "hotel" && (
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        {/* CONTACT */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          className="form-control mb-4"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          className="btn btn-success w-100"
          onClick={handleRegister}
        >
          Register
        </button>

        <p className="text-muted small mt-3">
          Already have an account?{" "}
          <span
            className="register-link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
