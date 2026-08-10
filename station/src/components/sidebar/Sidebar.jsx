import React, { useCallback } from "react";
import styles from "./Sidebar.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { MdDashboard, MdHistory, MdSettings, MdLogout } from "react-icons/md";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/");
  }, [navigate]);

  return (
    <div className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoGlow}>⚡</span> EV Station
      </div>

      {/* Menu Items */}
      <nav className={styles.menu}>
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            isActive
              ? `${styles.menuItem} ${styles.activeMenu}`
              : styles.menuItem
          }
        >
          <MdDashboard /> <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/dashboard/bookings"
          className={({ isActive }) =>
            isActive
              ? `${styles.menuItem} ${styles.activeMenu}`
              : styles.menuItem
          }
        >
          <MdHistory /> <span>Bookings</span>
        </NavLink>

        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            isActive
              ? `${styles.menuItem} ${styles.activeMenu}`
              : styles.menuItem
          }
        >
          <MdSettings /> <span>Settings</span>
        </NavLink>
      </nav>

      {/* Bottom Logout */}
      <button className={styles.logout} onClick={handleLogout}>
        <MdLogout /> <span>Logout</span>
      </button>
    </div>
  );
};

export default React.memo(Sidebar);
