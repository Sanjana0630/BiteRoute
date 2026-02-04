import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Package, IndianRupee, ShoppingBag, ArrowLeft } from "lucide-react";

export default function HotelProgress() {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get(`/api/hotels/${hotelId}/analytics/`);
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
                setError("Failed to load analytics data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [hotelId]);

    if (loading) return (
        <div className="container py-5 text-center">
            <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Calculating your progress...</p>
        </div>
    );

    if (error) return (
        <div className="container py-5 text-center text-danger">
            <h3>Oops!</h3>
            <p>{error}</p>
            <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );

    return (
        <div className="container py-5">
            <div className="d-flex align-items-center mb-4">
                <button className="btn btn-light rounded-circle me-3 shadow-sm" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="fw-bold mb-0">{data.hotel_name} - Monthly Progress 📈</h2>
                    <p className="text-muted mb-0">Track your hotel's performance over time</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100 p-4" style={{ borderRadius: "15px" }}>
                        <div className="d-flex align-items-center mb-3">
                            <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                                <IndianRupee className="text-success" size={24} />
                            </div>
                            <h6 className="text-muted fw-bold mb-0">Total Revenue</h6>
                        </div>
                        <h3 className="fw-bold mb-1">₹ {data.total_revenue.toLocaleString()}</h3>
                        <p className="small text-success mb-0"><TrendingUp size={14} className="me-1" /> Lifetime Earnings</p>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100 p-4" style={{ borderRadius: "15px" }}>
                        <div className="d-flex align-items-center mb-3">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                                <ShoppingBag className="text-primary" size={24} />
                            </div>
                            <h6 className="text-muted fw-bold mb-0">Total Orders</h6>
                        </div>
                        <h3 className="fw-bold mb-1">{data.total_orders}</h3>
                        <p className="small text-primary mb-0">Orders processed successfully</p>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-0 h-100 p-4" style={{ borderRadius: "15px" }}>
                        <div className="d-flex align-items-center mb-3">
                            <div className="bg-warning bg-opacity-10 p-2 rounded-3 me-3">
                                <Package className="text-warning" size={24} />
                            </div>
                            <h6 className="text-muted fw-bold mb-0">Items Sold</h6>
                        </div>
                        <h3 className="fw-bold mb-1">{data.total_items_sold}</h3>
                        <p className="small text-warning mb-0">Quantity of food items served</p>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Revenue Chart */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 p-4" style={{ borderRadius: "15px" }}>
                        <h5 className="fw-bold mb-4">Revenue Trend (Monthly)</h5>
                        <div style={{ width: '100%', height: 350 }}>
                            {data.chart_data.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.chart_data}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`₹ ${value}`, 'Revenue']}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#198754"
                                            strokeWidth={3}
                                            dot={{ r: 6, fill: "#198754", strokeWidth: 2, stroke: "#fff" }}
                                            activeDot={{ r: 8 }}
                                            name="Revenue"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100">
                                    <p className="text-muted italic">Not enough data to display revenue trend.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Best Sellers */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 p-4 h-100" style={{ borderRadius: "15px" }}>
                        <h5 className="fw-bold mb-4">Top 5 Best Sellers</h5>
                        <div style={{ width: '100%', height: 350 }}>
                            {data.best_sellers.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.best_sellers} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} style={{ fontSize: '13px' }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="sold" fill="#8884d8" radius={[0, 5, 5, 0]}>
                                            {data.best_sellers.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-center">
                                    <p className="text-muted italic">Best sellers will appear here once you make sales.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
