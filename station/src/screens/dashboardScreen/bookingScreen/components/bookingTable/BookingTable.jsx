import React, { useMemo, useCallback } from "react";
import styles from "./BookingTable.module.css";

const statusClassMap = {
  PENDING: styles.statusPending,
  INPROGRESS: styles.statusInProgress,
  COMPLETED: styles.statusCompleted,
  CANCELLED: styles.statusCancelled,
};

const paymentClassMap = {
  PAID: styles.paymentPaid,
  PENDING: styles.paymentPending,
};

const BookingTable = ({
  filteredData = [],
  toggleDropdown,
  isPortFull,
  confirmBooking,
  openDropdown,
  updateBookingStatus,
}) => {
  /** -------------------------------
   * Handlers
   --------------------------------*/
  const handleUpdate = useCallback(
    (id, status) => {
      updateBookingStatus(id, status);
      toggleDropdown(null);
    },
    [updateBookingStatus, toggleDropdown]
  );

  /** -------------------------------
   * Memoized Rows for performance
   --------------------------------*/
  const rows = useMemo(() => {
    if (!filteredData.length) return null;

    return filteredData.map((row) => {
      const isWaiting = row.isWaiting;
      const portId = row?.port_Id?._id;
      const isFull = portId ? isPortFull(portId) : false;

      return (
        <tr key={row._id}>
          <td>{row.userName || "-"}</td>
          <td>{row.userMobile || "-"}</td>
          <td>{row.vehicleType || "-"}</td>
          <td>{row?.port_Id?.portType || "-"}</td>
          <td>{row.units || "-"}</td>
          <td>₹{row.totalPrice || 0}</td>

          {/* Payment Badge */}
          <td>
            <span className={paymentClassMap[row.paymentStatus]}>
              {row.paymentStatus}
            </span>
          </td>

          {/* Booking Badge */}
          <td>
            <span className={statusClassMap[row.bookingStatus]}>
              {row.bookingStatus}
            </span>
          </td>

          <td>
            {row.startTime ? new Date(row.startTime).toLocaleString() : "-"}
          </td>
          <td>{row.endTime ? new Date(row.endTime).toLocaleString() : "-"}</td>

          <td>{row.waitingQueuePosition ?? "-"}</td>

          {/* Action */}
          <td className={styles.actionCell}>
            <div className={styles.dropdownWrapper}>
              {/* Update Status */}
              <button
                className={styles.updateBtn}
                onClick={() => toggleDropdown(row._id)}
              >
                Update Status
              </button>

              {/* Confirm Button — only for waiting users */}
              {isWaiting && (
                <div
                  className={isFull ? styles.tooltipWrapper : ""}
                  data-tooltip={
                    isFull ? "No free ports available to confirm" : ""
                  }
                >
                  <button
                    className={styles.confirmBtn}
                    disabled={isFull}
                    onClick={() => {
                      confirmBooking(row._id);
                    }}
                  >
                    Confirm
                  </button>
                </div>
              )}

              {/* Dropdown */}
              {openDropdown === row._id && (
                <div className={styles.dropdownMenu}>
                  {["INPROGRESS", "COMPLETED"].map((status) => (
                    <div
                      key={status}
                      className={styles.dropdownItem}
                      onClick={() => handleUpdate(row._id, status)}
                    >
                      {status.replace("_", " ")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      );
    });
  }, [
    filteredData,
    isPortFull,
    openDropdown,
    toggleDropdown,
    confirmBooking,
    handleUpdate,
  ]);

  return (
    <div className={styles.tableContainer}>
      <div className={styles.horizontalScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Mobile</th>
              <th>Vehicle</th>
              <th>Port</th>
              <th>kWh</th>
              <th>Amount (₹)</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
              <th>Queue</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData?.length === 0 ? (
              <tr>
                <td colSpan={12}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <div className={styles.emptyTitle}>No Results Found</div>
                    <div className={styles.emptySubtext}>
                      Try adjusting filters or search keywords
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              rows
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(BookingTable);
