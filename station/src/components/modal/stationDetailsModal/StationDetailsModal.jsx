import React, { useCallback, useEffect, useState } from "react";
import styles from "./StationDetailsModal.module.css";
import { FaTimes, FaChargingStation } from "react-icons/fa";
import { callApi } from "../../../config/axiosConfig";
import ViewMode from "./components/ViewMode";
import EditMode from "./components/EditMode";

const StationDetailsModal = ({ onClose }) => {
  const token = localStorage.getItem("station-authentication-token");

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    stationName: "",
    stationId: "",
    stationEmail: "",
    stationMobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    stationCoordinates: {
      type: "Point",
      coordinates: [],
    },
    vehicleType: [],
    openTime: "",
    closeTime: "",
  });

  /** GET STATION DETAILS */
  const getStationDetails = useCallback(async () => {
    const response = await callApi({
      method: "get",
      url: "/station/getStationDetails",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.success) return;

    const data = response.data.data;

    setFormData({
      stationName: data.stationName,
      stationId: data.stationId,
      stationEmail: data.stationEmail,
      stationMobile: data.stationMobile,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      stationCoordinates: data.stationCoordinates,
      vehicleType: data.vehicleType || [],
      openTime: data.openTime,
      closeTime: data.closeTime,
    });
  }, [token]);

  useEffect(() => {
    getStationDetails();
  }, [getStationDetails]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <div className={styles.header}>
          <FaChargingStation className={styles.icon} />
          <h2 className={styles.title}>
            {editMode ? "Edit Station Details" : "Station Details"}
          </h2>
        </div>

        {/* ------------------ VIEW MODE ------------------ */}
        {!editMode && <ViewMode station={formData} setEditMode={setEditMode} />}

        {/* ------------------ EDIT MODE ------------------ */}
        {editMode && (
          <EditMode
            formData={formData}
            handleChange={handleChange}
            setEditMode={setEditMode}
            setFormData={setFormData}
            getStationDetails={getStationDetails}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(StationDetailsModal);
