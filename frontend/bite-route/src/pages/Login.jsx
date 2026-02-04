import { useNavigate } from "react-router-dom";
import food1 from "../assets/image.png";
import food2 from "../assets/image2.jpeg";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-box">

          {/* Food images INSIDE box */}
          <div className="food-square">
            <img src={food1} alt="food" />
            <img src={food2} alt="food" />
          </div>

          <h2 className="mt-3">🍴 BiteRoute</h2>
          <p className="text-muted mb-4">
            Discover Indian food near you
          </p>



          <button
            className="btn btn-success w-100 mb-3"
            onClick={() => navigate("/login")}
          >
            Click here to login
          </button>

        </div>
      </div>
    </div>
  );
}

export default Login;
