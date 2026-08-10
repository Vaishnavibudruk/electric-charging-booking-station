import React from "react";
import styles from "../PortDetailsModal.module.css";

const ViewMode = ({ ports = [], setEditMode }) => {
  if (!ports || ports.length === 0) {
    return (
      <div className={styles.scrollablePorts}>
        <p>No Ports Found</p>
        <button className={styles.primaryBtn} onClick={() => setEditMode(true)}>
          Edit Ports
        </button>
      </div>
    );
  }

  const renderPortRow = (label, value) => (
    <div className={styles.viewGroup}>
      <label>{label}</label>
      <p>{value}</p>
    </div>
  );

  return (
    <div className={styles.scrollablePorts}>
      {ports.map((port, index) => (
        <div key={index} className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>Port {index + 1}</h3>

          <div className={styles.viewRow}>
            {renderPortRow("Port Type", port.portType)}
            {renderPortRow("Total Ports", port.totalPorts)}
          </div>

          <div className={styles.viewRow}>
            {renderPortRow("Available Ports", port.availablePorts)}
            {renderPortRow("In Use Ports", port.inUsePorts)}
          </div>

          <div className={styles.viewRow}>
            {renderPortRow("Price (₹)", port.price)}
          </div>
        </div>
      ))}

      <button className={styles.primaryBtn} onClick={() => setEditMode(true)}>
        Edit Ports
      </button>
    </div>
  );
};

export default React.memo(ViewMode);
