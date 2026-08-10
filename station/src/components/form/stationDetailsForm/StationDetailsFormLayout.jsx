import React from "react";
import styles from "./StationDetailsForm.module.css";
import { useNavigate } from "react-router-dom";

const StationDetailsFormLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // or remove specific token
    navigate("/");
  };

  return (
    <div className={styles.page}>
      <div className={styles.leftPanel}>
        {/* Logout Button */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>

        <div className={styles.overlay}>
          <h2>Register Your EV Station</h2>
          <p>Provide your station details to setup your dashboard</p>
        </div>
      </div>

      {children}
    </div>
  );
};

export default React.memo(StationDetailsFormLayout);
