import React from "react";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={`${styles.navbar}`}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.brandHighlight}>EVC</span> Booking
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
