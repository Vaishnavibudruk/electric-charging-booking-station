import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { AppAssets } from "../../constant/AppAssets";
import UserDropdown from "./userDropdown/UserDropdown";

const Navbar = () => {
  const isHomeScreen = window.location.pathname === "/";

  const [scroll, setScroll] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("user-authentication-token")
  );

  const handleScroll = () => {
    setScroll(window.pageYOffset > 120);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-light ${styles.navbarColor} ${
        scroll ? `fixed-top ${styles.fixedNavbarColor}` : ""
      } ${!isHomeScreen ? `fixed-top ${styles.fixedNavbarColor}` : ""}`}
    >
      <div className="container">
        {/* BRAND */}
        <Link
          to="/"
          className={`${styles.navbarBrand} fs-3 fw-bold d-lg-flex align-items-center`}
        >
          <img
            src={AppAssets.appLogo}
            className={`${styles.logoImage} me-1`}
            alt=""
          />
        </Link>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* Center Nav */}
          <ul className={`navbar-nav ${styles.centerNav}`}>
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.activeLink}`
                    : styles.navLink
                }
                end
              >
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.activeLink}`
                    : styles.navLink
                }
              >
                Explore
              </NavLink>
            </li>

            {isLoggedIn && (
              <li className="nav-item">
                <NavLink
                  to="/your-bookings"
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navLink} ${styles.activeLink}`
                      : styles.navLink
                  }
                >
                  Your Bookings
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right */}
          <div className="ms-auto d-flex align-items-center gap-3">
            {!isLoggedIn && (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.signInButton} ${styles.activeLink}`
                    : styles.signInButton
                }
              >
                Sign In
              </NavLink>
            )}

            {isLoggedIn && <UserDropdown setIsLoggedIn={setIsLoggedIn} />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
