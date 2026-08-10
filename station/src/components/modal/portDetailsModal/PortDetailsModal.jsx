import React, { useState, useEffect, useCallback } from "react";
import styles from "./PortDetailsModal.module.css";
import { FaTimes, FaPlug } from "react-icons/fa";
import { callApi } from "../../../config/axiosConfig";
import ViewMode from "./components/ViewMode";
import EditMode from "./components/EditMode";

const PortDetailsModal = ({ onClose }) => {
  const token = localStorage.getItem("station-authentication-token");

  const [editMode, setEditMode] = useState(false);
  const [ports, setPorts] = useState([]);

  /** FETCH PORTS */
  const getPorts = useCallback(async () => {
    const response = await callApi({
      method: "get",
      url: "/station/getPorts",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.success) return;

    setPorts(response.data.data);
  }, [token]);

  useEffect(() => {
    getPorts();
  }, [getPorts]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <div className={styles.header}>
          <FaPlug className={styles.icon} />
          <h2 className={styles.title}>
            {editMode ? "Edit Port Details" : "Port Details"}
          </h2>
        </div>

        {/* ------------------ VIEW MODE ------------------ */}
        {!editMode && <ViewMode ports={ports} setEditMode={setEditMode} />}

        {/* ------------------ EDIT MODE ------------------ */}
        {editMode && (
          <EditMode
            setEditMode={setEditMode}
            ports={ports}
            setPorts={setPorts}
            getPorts={getPorts}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(PortDetailsModal);
