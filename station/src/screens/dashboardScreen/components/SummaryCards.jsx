import React from "react";
import styles from "../DashboardScreen.module.css";

const SummaryCards = ({ summary }) => {
  return (
    <div className={styles.summaryGrid}>
      <div className={styles.card}>
        <h3>Total Bookings Today</h3>
        <p>{summary.totalBookings}</p>
      </div>

      <div className={styles.card}>
        <h3>Total Revenue</h3>
        <p>₹{summary.totalRevenue}</p>
      </div>

      <div className={styles.card}>
        <h3>Active Charging Sessions</h3>
        <p>{summary.activeSessions}</p>
      </div>

      <div className={styles.card}>
        <h3>Available Ports</h3>
        <p>
          {summary.availablePorts} / {summary.totalPorts}
        </p>
      </div>
    </div>
  );
};

export default React.memo(SummaryCards);
