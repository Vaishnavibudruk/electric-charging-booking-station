import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./UserDropdown.module.css";
import { FaUserCircle, FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { callApi } from "../../../config/axiosConfig";

const UserDropdown = ({ setIsLoggedIn }) => {
  const token = localStorage.getItem("user-authentication-token");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    userName: "",
    mobile: "",
  });

  const menuRef = useRef();

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  const toggleDropdown = () => setOpen(!open);

  const getProfileDetails = useCallback(async () => {
    const response = await callApi({
      method: "get",
      url: "/user/getProfile",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.success) return;

    setUser(response.data.data);

    setFormData({
      userName: response.data.data.userName,
      email: response.data.data.email,
      mobile: response.data.data.mobile,
    });
  }, [token]);

  useEffect(() => {
    getProfileDetails();
  }, [getProfileDetails]);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update profile API
  const handleUpdateProfile = async () => {
    try {
      const response = await callApi({
        method: "put",
        url: "/user/updateProfile",
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.success) {
        setShowEditModal(false);
        getProfileDetails();
        alert(response.data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className={styles.dropdownWrapper} ref={menuRef}>
        <FaUserCircle
          size={30}
          className={styles.userIcon}
          onClick={toggleDropdown}
        />

        {open && (
          <div className={styles.dropdownMenu}>
            <div className={styles.userInfo}>
              <h5>{user?.userName}</h5>

              <p className="d-flex align-items-center gap-2">
                <MdEmail /> {user?.email}
              </p>

              <p className="d-flex align-items-center gap-2">
                <FaPhoneAlt /> {user?.mobile}
              </p>
            </div>

            <button
              className={styles.updateButton}
              onClick={() => setShowEditModal(true)}
            >
              Update Profile
            </button>

            <hr style={{ color: "gray" }} />

            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showEditModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEditModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Update Profile</h3>

            <input
              type="text"
              placeholder="Name"
              className={styles.modalInput}
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              className={styles.modalInput}
              value={formData.email}
              disabled
            />

            <input
              type="text"
              placeholder="Mobile"
              className={styles.modalInput}
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
            />

            <div className={styles.buttonRow}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button className={styles.saveBtn} onClick={handleUpdateProfile}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(UserDropdown);
