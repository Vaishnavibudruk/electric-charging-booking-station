import React, { useState } from "react";
import styles from "./SettingScreen.module.css";
import {
  FaUserCircle,
  FaLock,
  FaChargingStation,
  FaTools,
} from "react-icons/fa";

import ProfileModal from "../../../components/modal/profileModal/ProfileModal";
import StationDetailsModal from "../../../components/modal/stationDetailsModal/StationDetailsModal";
import PortDetailsModal from "../../../components/modal/portDetailsModal/PortDetailsModal";
import UpdatePasswordModal from "../../../components/modal/updatePasswordModal/UpdatePasswordModal";

const SettingScreen = () => {
  const [activeModal, setActiveModal] = useState(null);

  // ---------------- CONFIG DRIVEN CARDS ----------------
  const settingOptions = [
    {
      id: "profile",
      Icon: FaUserCircle,
      title: "View Profile",
      description: "View your personal and business information.",
      button: "Open Profile",
      Modal: ProfileModal,
    },
    {
      id: "password",
      Icon: FaLock,
      title: "Update Password",
      description: "Change your password for better security.",
      button: "Change Password",
      Modal: UpdatePasswordModal,
    },
    {
      id: "station",
      Icon: FaChargingStation,
      title: "Station Details",
      description: "Update station name, address, coordinates & timings.",
      button: "Update Station",
      Modal: StationDetailsModal,
    },
    {
      id: "ports",
      Icon: FaTools,
      title: "Manage Ports",
      description: "Add, remove or modify charging ports & pricing.",
      button: "Update Ports",
      Modal: PortDetailsModal,
    },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Settings</h2>

      <div className={styles.cardGrid}>
        {settingOptions.map(({ id, Icon, title, description, button }) => (
          <div className={styles.settingCard} key={id}>
            <div className={styles.iconBox}>
              <Icon className={styles.icon} />
            </div>

            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardText}>{description}</p>

            <button
              className={styles.primaryBtn}
              onClick={() => setActiveModal(id)}
            >
              {button}
            </button>
          </div>
        ))}
      </div>

      {/* DYNAMIC MODAL RENDERING */}
      {settingOptions.map(({ id, Modal }) =>
        activeModal === id ? (
          <Modal key={id} onClose={() => setActiveModal(null)} />
        ) : null
      )}
    </div>
  );
};

export default React.memo(SettingScreen);
