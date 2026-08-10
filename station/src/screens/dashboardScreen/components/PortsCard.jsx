import React from "react";
import styles from "../DashboardScreen.module.css";

const PortsCard = ({ ports = [] }) => {
  return ports?.map((port, index) => (
    <div key={index} className={styles.portCard}>
      <div className={styles.portHeader}>
        <div className={styles.portIcon}>⚡</div>
        <div className={styles.portName}>{port.portType}</div>
      </div>

      <div className={styles.portStats}>
        <p>
          Total Ports: <span>{port.totalPorts}</span>
        </p>
        <p>
          Available: <span>{port.availablePorts}</span>
        </p>
        <p>
          Booked: <span>{port.inUsePorts}</span>
        </p>
        <p>
          Price: <span>₹{port.price}/kWh</span>
        </p>
      </div>
    </div>
  ));
};

export default React.memo(PortsCard);
