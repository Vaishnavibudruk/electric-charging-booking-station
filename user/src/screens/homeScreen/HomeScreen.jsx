import React, { useEffect } from "react";
import styles from "./HomeScreen.module.css";
import Navbar from "../../components/navbar/Navbar";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const HomeScreen = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <>
      <div className={`${styles.container}`}>
        {/* Top Heading */}
        <div
          className="d-flex flex-column align-items-center justify-content-center h-100 border-bottom"
          data-aos="fade-down"
        >
          <h1 className={styles.heading}>
            A milestone today. A movement forever.
          </h1>
        </div>

        {/* Hero Section */}
        <div className={styles.heroSection}>
          <Navbar />

          <div className={styles.heroTextWrapper}>
            <h1 className={styles.heroTitle} data-aos="zoom-in">
              EVC-Booking
            </h1>

            <p
              className={styles.heroSubtitle}
              data-aos="fade-up"
              data-aos-delay="200"
            >
              A smarter, faster and reliable way to locate and book EV charging
              stations.
            </p>

            <div className="d-flex align-items-center mt-3">
              <Link
                to="/search"
                className={styles.signInButton}
                data-aos="fade-up"
                data-aos-delay="400"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>

        {/* Network Section */}
        <div className={styles.networkSection}>
          <h1 className={styles.networkTitle} data-aos="fade-up">
            Join our network of 7000+
          </h1>

          <h1
            className={styles.networkSubTitle}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            EV Charging Stations
          </h1>
        </div>
      </div>
    </>
  );
};

export default React.memo(HomeScreen);
