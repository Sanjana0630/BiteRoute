import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, PlusCircle, ArrowLeft, Trash2 } from "lucide-react";

export default function ManageHotel() {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const { user, role } = useAuth();

    const [foods, setFoods] = useState([]);
    const [hotelInfo, setHotelInfo] = useState({ name: "", categories: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleDelete = async (foodId) => {
        if (!window.confirm("Are you sure you want to delete this food item?")) return;

        try {
            // Updated endpoint to match backend
            await api.delete(`/api/foods/${foodId}/delete/`);
            setFoods(foods.filter((food) => food.id !== foodId));
        } catch (err) {
            console.error("Failed to delete food item", err);
            alert("Failed to delete food item");
        }
    };

    useEffect(() => {
        if (!user || role !== "hotel") {
            navigate("/login");
            return;
        }

        const fetchFoodItems = async () => {
            try {
                const res = await api.get(`/api/hotels/${hotelId}/foods/`);
                setFoods(res.data.foods);
                setHotelInfo({
                    name: res.data.hotel_name,
                    categories: res.data.food_type
                });
            } catch (err) {
                console.error("Failed to fetch food items", err);
                setError(err.response?.data?.message || "Failed to load food items. Please make sure you have permission to manage this hotel.");
            } finally {
                setLoading(false);
            }
        };

        fetchFoodItems();
    }, [hotelId, user, role, navigate]);

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-center">
                    <button className="btn btn-light rounded-circle me-3 shadow-sm" onClick={() => navigate("/hoteldata")}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h3 className="fw-bold m-0">🍴 Manage {hotelInfo.name || "Hotel"}</h3>
                        {/* Calculate unique categories from registered info AND added food items */}
                        {(hotelInfo.categories || foods.length > 0) && (
                            <p className="text-muted small mb-0 d-flex align-items-center gap-2 flex-wrap">
                                Categories:
                                {[...new Set([
                                    ...(hotelInfo.categories ? hotelInfo.categories.split(",").map(c => c.trim()) : []),
                                    ...foods.map(f => f.category)
                                ])].filter(Boolean).map((cat, index) => (
                                    <span key={index} className="badge bg-light text-dark border">
                                        {cat}
                                    </span>
                                ))}
                            </p>
                        )}
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Link
                        to={`/hotel/${hotelId}/progress`}
                        className="btn btn-outline-success d-flex align-items-center gap-2"
                    >
                        <TrendingUp size={18} /> View Progress
                    </Link>
                    <Link
                        to="/add-food"
                        state={{ hotelName: hotelInfo.name }}
                        className="btn btn-dark d-flex align-items-center gap-2"
                    >
                        <PlusCircle size={18} /> Add More Food
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : (
                <div className="card shadow-sm">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0 fw-bold text-success">Food Items List</h5>
                    </div>
                    <div className="card-body p-0">
                        {foods.length === 0 ? (
                            <div className="p-5 text-center">
                                <p className="text-muted mb-0">No food items added yet.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Food Name</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Description</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {foods.map((food) => (
                                            <tr key={food.id}>
                                                <td className="fw-bold">{food.food_name}</td>
                                                <td>
                                                    <span className="badge bg-info text-dark">
                                                        {food.category}
                                                    </span>
                                                </td>
                                                <td className="text-success fw-bold">₹{food.price}</td>
                                                <td className="small text-muted">{food.description || "N/A"}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(food.id)}
                                                        title="Delete Food Item"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
