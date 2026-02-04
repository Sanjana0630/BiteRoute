import { useState } from "react";

export default function SearchForm({ type, onSearch, onBack }) {
  const [food, setFood] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!food.trim() || !location.trim()) {
      setError("Please enter food item and location");
      return;
    }

    // 🛡️ VALIDATION: Check for cross-category search
    const lowerFood = food.toLowerCase();
    const normalizedType = type.toLowerCase();

    const nonVegKeywords = ["chicken", "mutton", "fish", "egg", "prawn", "seafood", "beef", "meat", "liver", "pork", "non-veg"];
    const vegKeywords = ["paneer", "gobi", "aloo", "dal", "mushroom", "tofu", "vegetarian", "pure veg", "veg thali", "veg rice", "veg food", "veg "];

    // 1. Check if user is in "Veg" but searching for Non-Veg items
    if (normalizedType === "veg") {
      const isNonVeg = nonVegKeywords.some((keyword) => lowerFood.includes(keyword));
      if (isNonVeg) {
        setError("Select correct category (Found Non-Veg item)");
        return;
      }
    }

    // 2. Check if user is in "Non-Veg" but searching for Veg items
    if (normalizedType.includes("non")) {
      // Check for strictly veg keywords
      const containsVegKeyword = vegKeywords.some(keyword => lowerFood.includes(keyword));

      // Also check for "veg" but NOT "non-veg"
      const isPureVegSearch = lowerFood.includes("veg") && !lowerFood.includes("non-veg");

      if (containsVegKeyword || isPureVegSearch) {
        setError("Select correct category (Found Veg item)");
        return;
      }
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://127.0.0.1:8000/api/user/search-food/?type=${encodeURIComponent(
          type
        )}&food=${encodeURIComponent(food)}&location=${encodeURIComponent(
          location
        )}`
      );

      const data = await res.json();

      onSearch({
        type,
        food,
        location,
        results: data,
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Server not responding");
    }
  };

  return (
    /* ✅ CENTER WRAPPER */
    <div className="d-flex flex-column align-items-center mt-5">
      {/* ✅ BACK BUTTON */}
      <button
        className="btn btn-link text-success mb-3 p-0 d-flex align-items-center gap-1"
        onClick={onBack}
        style={{ textDecoration: 'none', fontWeight: '500' }}
      >
        <span>←</span> Back to Categories
      </button>

      {/* ✅ SMALL CARD */}
      <div
        className="card p-4 shadow-sm"
        style={{
          width: "100%",
          maxWidth: "420px", // 👈 controls size
          borderRadius: "12px",
        }}
      >
        <h5 className="fw-bold mb-3 text-center">
          {type} 🍛
        </h5>

        {error && (
          <p className="text-danger small text-center">{error}</p>
        )}

        <input
          type="text"
          className="form-control mb-3"
          placeholder={`Enter ${type} food item`}
          value={food}
          onChange={(e) => setFood(e.target.value)}
        />

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button
          className="btn btn-success w-100"
          onClick={handleSubmit}
        >
          {loading ? "Searching nearby hotels..." : "Search Hotels"}
        </button>
      </div>
    </div>
  );
}
