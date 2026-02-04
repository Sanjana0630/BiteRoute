
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token, role } = useAuth();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect based on role or to home/login
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
