import React, { useState } from "react";
import styles from "./UpdatePasswordModal.module.css";
import { FaTimes, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { callApi } from "../../../config/axiosConfig";
import { validatePassword } from "../../../utils/validation";

const UpdatePasswordModal = ({ onClose }) => {
  const token = localStorage.getItem("station-authentication-token");

  const [formData, setFormData] = useState({
    originalPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    originalPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // ----------- HANDLE INPUT CHANGE -----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----------- TOGGLE PASSWORD VISIBILITY -----------
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ----------- HANDLE SUBMIT -----------
  const handleSubmit = async () => {
    const { originalPassword, newPassword, confirmPassword } = formData;

    const validatePass = validatePassword(newPassword);

    if (validatePass) {
      alert(validatePass);
      return;
    }

    if (!originalPassword || !newPassword || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password & confirm password do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await callApi({
        method: "put",
        url: "/station/change-password",
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.success) {
        alert(response.data?.message || "Password updated successfully");
        onClose();
      }
    } catch (err) {
      console.error("Password update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Original Password", name: "originalPassword" },
    { label: "New Password", name: "newPassword" },
    { label: "Confirm New Password", name: "confirmPassword" },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>

        <div className={styles.header}>
          <FaLock className={styles.icon} />
          <h2 className={styles.title}>Change Password</h2>
        </div>

        {fields.map(({ label, name }) => (
          <div key={name} className={styles.inputGroup}>
            <label className={styles.label}>{label}</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword[name] ? "text" : "password"}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={styles.input}
              />
              <span
                className={styles.eyeIcon}
                onClick={() => togglePasswordVisibility(name)}
              >
                {showPassword[name] ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
        ))}

        <div className={styles.btnRow}>
          <button
            className={styles.primaryBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UpdatePasswordModal);
