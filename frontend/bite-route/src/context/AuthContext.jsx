
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [role, setRole] = useState(localStorage.getItem("role") || null);

    useEffect(() => {
        // Sync state with local storage on mount
        const storedToken = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");
        const storedUser = localStorage.getItem("user");

        if (storedToken) {
            setToken(storedToken);
        }
        if (storedRole) {
            setRole(storedRole);
        }
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData, authToken, userRole) => {
        setUser(userData);
        setToken(authToken);
        setRole(userRole);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", authToken);
        localStorage.setItem("role", userRole);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ user, token, role, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
