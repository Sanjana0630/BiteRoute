import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";

import Login from "./pages/Login";
import Home from "./pages/Home";
import CommonLogin from "./pages/CommonLogin";
import CommonRegister from "./pages/CommonRegister";

import Hdashboard from "./pages/Hdashboard";
import HotelDetails from "./pages/HotelDetails";
import AddFoodMenu from "./pages/AddFoodMenu";

import ManageHotel from "./pages/ManageHotel";
import HotelProgress from "./pages/HotelProgress";
import AdminDashboard from "./pages/AdminDashboard";
import FoodResults from "./pages/FoodResult";
import Cart from "./pages/cart";
import Checkout from "./pages/Checkout";
import HotelData from "./pages/Hoteldata";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

function AppRoutes() {
  const location = useLocation();
  const authPaths = ["/", "/login", "/common-register"];
  const showNavAndFooter = !authPaths.includes(location.pathname);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {showNavAndFooter && <Navbar />}

      <main style={{ flex: "1", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <Routes>
          {/* Public / Auth pages */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<CommonLogin />} />
          <Route path="/common-register" element={<CommonRegister />} />

          {/* User */}
          <Route path="/home" element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute allowedRoles={["user"]}>
              <FoodResults />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Checkout />
            </ProtectedRoute>
          } />

          {/* Hotel Owner */}
          <Route path="/hoteldashboard" element={
            <ProtectedRoute allowedRoles={["hotel"]}>
              <Hdashboard />
            </ProtectedRoute>
          } />
          <Route path="/hotel-details" element={
            <ProtectedRoute allowedRoles={["hotel"]}>
              <HotelDetails />
            </ProtectedRoute>
          } />
          <Route path="/add-food" element={
            <ProtectedRoute allowedRoles={["hotel"]}>
              <AddFoodMenu />
            </ProtectedRoute>
          } />
          <Route path="/hoteldata" element={
            <ProtectedRoute allowedRoles={["hotel"]}>
              <HotelData />
            </ProtectedRoute>
          } />
          <Route path="/manage-hotel/:hotelId" element={
            <ProtectedRoute allowedRoles={["hotel"]}>
              <ManageHotel />
            </ProtectedRoute>
          } />
          <Route path="/hotel/:hotelId/progress" element={
            <ProtectedRoute allowedRoles={["hotel"]}>
              <HotelProgress />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {showNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
