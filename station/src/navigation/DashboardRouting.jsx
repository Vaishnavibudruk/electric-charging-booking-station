import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardScreen from "../screens/dashboardScreen/DashboardScreen";
import Sidebar from "../components/sidebar/Sidebar";
import BookingScreen from "../screens/dashboardScreen/bookingScreen/BookingScreen";
import SettingScreen from "../screens/dashboardScreen/settingScreen/SettingScreen";
import StationDetailsPage from "../screens/dashboardScreen/settingScreen/stationDetailPage/StationDetailsPage";
import PortDetailsPage from "../screens/dashboardScreen/settingScreen/portDetailsPage/PortDetailsPage";

const DashboardRouting = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      {/* Content area */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/bookings" element={<BookingScreen />} />
          <Route path="/settings" element={<SettingScreen />} />
          <Route
            path="/settings/station-details"
            element={<StationDetailsPage />}
          />
          <Route path="/settings/station-port" element={<PortDetailsPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default React.memo(DashboardRouting);
