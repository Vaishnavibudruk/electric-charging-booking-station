import React from "react";
import styles from "../DashboardScreen.module.css";

const DashboardBookingTable = ({ bookings = [] }) => {
  const hasData = bookings.length > 0;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>User</th>
            <th>Port</th>
            <th>Time</th>
            <th>kWh</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Payment Status</th>
          </tr>
        </thead>

        <tbody>
          {!hasData ? (
            <tr>
              <td colSpan={7}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📭</div>
                  <div className={styles.emptyTitle}>No Bookings Available</div>
                  <div className={styles.emptySubtext}>
                    New bookings will appear here once created
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.userName || "-"}</td>
                <td>{b.port_Id?.portType || "-"}</td>
                <td>
                  {b.createdAt
                    ? new Date(b.createdAt).toLocaleTimeString()
                    : "-"}
                </td>
                <td>{b.units ?? "-"}</td>
                <td>₹{b.totalPrice ?? 0}</td>
                <td>{b.bookingStatus}</td>
                <td
                  className={
                    b.paymentStatus === "PAID"
                      ? styles.paymentPaid
                      : styles.paymentPending
                  }
                >
                  {b.paymentStatus}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(DashboardBookingTable);
