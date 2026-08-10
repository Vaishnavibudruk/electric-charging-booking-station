import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StationPortCreateScreen from "../screens/stationPortScreen/StationPortCreateScreen";

const RegisterScreen = React.lazy(() =>
  import("../screens/registerScreen/RegisterScreen")
);
const LoginScreen = React.lazy(() =>
  import("../screens/loginScreen/LoginScreen")
);
const ForgotPasswordScreen = React.lazy(() =>
  import("../screens/forgotPasswordScreen/ForgotPasswordScreen")
);
const OtpScreen = React.lazy(() => import("../screens/otpScreen/OtpScreen"));
const StationDetailsScreen = React.lazy(() =>
  import("../screens/stationDetailsScreen/StationDetailsScreen")
);
const DashboardRouting = React.lazy(() => import("./DashboardRouting"));

const Routing = () => {
  const isTokenValid = () => {
    return localStorage.getItem("station-authentication-token") !== null;
  };

  const ProtectedRoute = ({ children }) => {
    return isTokenValid() ? children : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/otp" element={<OtpScreen />} />

          {/* Protected Routes */}
          <Route
            path="/details-form"
            element={
              <ProtectedRoute>
                <StationDetailsScreen />
              </ProtectedRoute>
            }
          />

          <Route
            path="/details-port"
            element={
              <ProtectedRoute>
                <StationPortCreateScreen />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardRouting />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Routing;
