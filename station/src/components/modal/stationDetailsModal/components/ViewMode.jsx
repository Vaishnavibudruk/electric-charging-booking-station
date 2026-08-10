import React from "react";
import styles from "../StationDetailsModal.module.css";

// Helper for a single label-value pair
const ViewField = ({ label, value }) => (
  <div className={styles.viewGroup}>
    <label>{label}</label>
    <p>{value || "-"}</p>
  </div>
);

// Helper for vehicle types
const VehicleTypeBadges = ({ types }) => (
  <div className={styles.viewGroup}>
    <label>Vehicle Types</label>
    <div className={styles.badgeContainer}>
      {types?.length ? (
        types.map((v, idx) => (
          <span key={idx} className={styles.badge}>
            {v}
          </span>
        ))
      ) : (
        <p>-</p>
      )}
    </div>
  </div>
);

const ViewMode = ({ station, setEditMode }) => {
  return (
    <div className={styles.viewContainer}>
      <div className={styles.viewRow}>
        <ViewField label="Name" value={station?.stationName} />
        <ViewField label="Station ID" value={station?.stationId} />
      </div>

      <div className={styles.viewRow}>
        <ViewField label="Email" value={station?.stationEmail} />
        <ViewField label="Mobile" value={station?.stationMobile} />
      </div>

      <div className={styles.viewGroupFull}>
        <ViewField label="Address" value={station?.address} />
      </div>

      <div className={styles.viewRow}>
        <ViewField label="State" value={station?.state} />
        <ViewField label="City" value={station?.city} />
        <ViewField label="Pincode" value={station?.pincode} />
      </div>

      <div className={styles.viewRow}>
        <VehicleTypeBadges types={station?.vehicleType} />
        <ViewField label="Open Time" value={station?.openTime} />
        <ViewField label="Close Time" value={station?.closeTime} />
      </div>

      <button className={styles.primaryBtn} onClick={() => setEditMode(true)}>
        Edit Details
      </button>
    </div>
  );
};

export default React.memo(ViewMode);
