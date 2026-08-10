import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeScreen from "../screens/homeScreen/HomeScreen";
import SearchScreen from "../screens/searchScreen/SearchScreen";
import LoginScreen from "../screens/loginScreen/LoginScreen";
import RegisterScreen from "../screens/registerScreen/RegisterScreen";
import OtpScreen from "../screens/otpScreen/OtpScreen";
import ForgotPasswordScreen from "../screens/forgotPasswordScreen/ForgotPasswordScreen";
import YourBookingScreen from "../screens/yourBookingScreen/YourBookingScreen";

const Routing = () => {
  const isTokenValid = () => {
    return localStorage.getItem("user-authentication-token") !== null;
  };

  const ProtectedRoute = ({ element }) => {
    return isTokenValid() ? element : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/otp" element={<OtpScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

          {/* 🔒 Protected */}
          <Route
            path="/your-bookings"
            element={<ProtectedRoute element={<YourBookingScreen />} />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Routing;
