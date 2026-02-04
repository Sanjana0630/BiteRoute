import { useState, useEffect } from "react";
import type from "../data/type";
import SearchForm from "../Components/SearchForm";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  const handleCardClick = (type) => {
    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  // ✅ RECEIVE RESULTS AND PASS THEM
  const handleSearch = ({ type, food, location, results }) => {
    navigate("/results", {
      state: {
        type,
        food,
        location,
        results,
      },
    });
  };

  return (
    <div className="home-bg">
      <div className="container py-5">
        <h1 className="text-center fw-bold mb-4">
          Explore Food Types 🍽️
        </h1>

        <p className="text-center mb-5 text-muted">
          Choose your favorite type and discover nearby food
        </p>

        {!selectedType && (
          <div className="row g-4 justify-content-center">
            {type.map((item) => (
              <div
                key={item.id}
                className="col-12 col-md-5"
              >
                <div
                  className="menu-card shadow-sm border-0 h-100 overflow-hidden d-flex flex-column"
                  style={{ borderRadius: "15px", transition: "transform 0.3s" }}
                  onClick={() => handleCardClick(item.name)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{ height: "200px", overflow: "hidden bg-light" }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  <div
                    className="menu-content text-white p-3 text-center flex-grow-1 d-flex flex-column justify-content-center"
                    style={{
                      background: item.name === "Non-Veg"
                        ? "linear-gradient(45deg, #e53935, #ef5350)" // Red gradient for Non-Veg
                        : "linear-gradient(45deg, #198754, #20c997)" // Green gradient for Veg
                    }}
                  >
                    <h5 className="fw-bold mb-1">{item.name}</h5>
                    <p className="small mb-0 opacity-75">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedType && (
          <SearchForm
            type={selectedType}
            onSearch={handleSearch}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
