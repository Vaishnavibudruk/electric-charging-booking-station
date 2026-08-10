import React, { useCallback, useEffect, useState } from "react";
import styles from "./ProfileModal.module.css";
import { FaTimes, FaUserCircle } from "react-icons/fa";
import { callApi } from "../../../config/axiosConfig";

const ProfileModal = ({ onClose }) => {
  const token = localStorage.getItem("station-authentication-token");

  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobile: "",
  });

  // ------------- FETCH PROFILE -------------
  const getProfileDetails = useCallback(async () => {
    try {
      const response = await callApi({
        method: "get",
        url: "/station/getProfile",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.success) return;

      const data = response.data.data || {};
      setUser(data);
      setFormData({
        userName: data.userName || "",
        email: data.email || "",
        mobile: data.mobile || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }, [token]);

  // ------------- HANDLERS -------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      const response = await callApi({
        method: "put",
        url: "/station/updateProfile",
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.success) {
        setEditMode(false);
        getProfileDetails();
        alert(response.data.message || "Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile. Try again.");
    }
  };

  // ------------- INPUT FIELDS CONFIG -------------
  const editFields = [
    { label: "Name", name: "userName", type: "text", disabled: false },
    { label: "Email", name: "email", type: "email", disabled: true },
    { label: "Phone", name: "mobile", type: "text", disabled: false },
  ];

  useEffect(() => {
    getProfileDetails();
  }, [getProfileDetails]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <div className={styles.header}>
          <FaUserCircle className={styles.profileIcon} />
          <h2 className={styles.title}>
            {editMode ? "Edit Profile" : "Profile Details"}
          </h2>
        </div>

        {/* ---------- VIEW MODE ---------- */}
        {!editMode && (
          <div className={styles.details}>
            <p>
              <strong>Name:</strong> {user?.userName}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Phone:</strong> {user?.mobile}
            </p>

            <button
              className={styles.primaryBtn}
              style={{ marginTop: 18, width: "100%" }}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* ---------- EDIT MODE ---------- */}
        {editMode && (
          <div className={styles.editForm}>
            {editFields.map(({ label, name, type, disabled }) => (
              <div key={name} className={styles.inputGroup}>
                <label className={styles.label}>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  disabled={disabled}
                  className={disabled ? styles.inputDisabled : styles.input}
                />
              </div>
            ))}

            <div className={styles.btnRow}>
              <button className={styles.primaryBtn} onClick={saveProfile}>
                Save Changes
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProfileModal);
