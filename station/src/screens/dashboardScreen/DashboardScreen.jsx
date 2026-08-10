import React, { useState, useEffect, useCallback } from "react";
import styles from "./DashboardScreen.module.css";
import { callApi } from "../../config/axiosConfig";
import SummaryCards from "./components/SummaryCards";
import PortsCard from "./components/PortsCard";
import DashboardBookingTable from "./components/DashboardBookingTable";

const DashboardScreen = () => {
  const token = localStorage.getItem("station-authentication-token");

  const [ports, setPorts] = useState([]);
  const [stationId, setStationId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeSessions: 0,
    availablePorts: 0,
    totalPorts: 0,
  });

  /** FETCH PORTS */
  const getPorts = useCallback(async () => {
    const response = await callApi({
      method: "get",
      url: "/station/getPorts",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.success) return;

    setPorts(response.data.data);
    setStationId(response.data.station_id);
    localStorage.setItem("station-id", response.data.station_id);

    // Calculate summary
    const totalPorts = response.data.data.reduce(
      (acc, port) => acc + port.totalPorts,
      0
    );
    const availablePorts = response.data.data.reduce(
      (acc, port) => acc + port.availablePorts,
      0
    );

    setSummary((prev) => ({
      ...prev,
      availablePorts,
      totalPorts,
    }));
  }, [token]);

  /** FETCH BOOKINGS AND FILTER TODAY */
  useEffect(() => {
    const fetchBookings = async () => {
      if (!stationId) return;

      const res = await callApi({
        url: `/booking/station/bookings/${stationId}`,
        method: "get",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.success) {
        return;
      }

      const allBookings = res.data.data;

      // Filter today's bookings
      const today = new Date();
      const todaysBookings = allBookings.filter((booking) => {
        const bookingDate = new Date(booking.createdAt);
        return (
          bookingDate.getFullYear() === today.getFullYear() &&
          bookingDate.getMonth() === today.getMonth() &&
          bookingDate.getDate() === today.getDate()
        );
      });

      setBookings(todaysBookings);

      // Update summary
      const totalBookings = todaysBookings.length;
      const totalRevenue = todaysBookings.reduce(
        (acc, booking) => acc + booking.totalPrice,
        0
      );
      const activeSessions = todaysBookings.filter(
        (b) => b.bookingStatus.toLowerCase() === "inprogress"
      ).length;

      setSummary((prev) => ({
        ...prev,
        totalBookings,
        totalRevenue,
        activeSessions,
      }));
    };

    fetchBookings();
  }, [stationId, token]);

  useEffect(() => {
    getPorts();
  }, [getPorts]);

  return (
    <div className={styles.dashboardWrapper}>
      {/* Top Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Port Breakdown */}
      <div className={styles.portGrid}>
        {ports.length === 0 ? (
          <p>No ports available</p>
        ) : (
          <PortsCard ports={ports} />
        )}
      </div>

      {/* Today's Bookings */}
      <div className={styles.section}>
        <h2>Today's Bookings</h2>
        <DashboardBookingTable bookings={bookings} />
      </div>
    </div>
  );
};

export default React.memo(DashboardScreen);
