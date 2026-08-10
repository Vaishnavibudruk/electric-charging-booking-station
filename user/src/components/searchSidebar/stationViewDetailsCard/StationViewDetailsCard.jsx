import React, { useEffect, useState, useCallback } from "react";
import styles from "./StationViewDetailsCard.module.css";
import { formatTime } from "../../../utils/CustomFunctions";
import { callApi } from "../../../config/axiosConfig";
import BookingModal from "../../modal/bookingModal/BookingModal";
import { useNavigate } from "react-router-dom";

const StationViewDetailsCard = ({ goBackToList, selectedStation }) => {
  const navigate = useNavigate();

  const token = localStorage.getItem("user-authentication-token");

  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState(null); // 👈 accordion state
  const [showModal, setShowModal] = useState(false);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleBookingOnClick = useCallback(() => {
    if (!token) {
      alert("Please login first");
      navigate("/login");
    } else {
      setShowModal(true);
    }
  }, [navigate, token]);

  // Fetch all port details
  const fetchPorts = useCallback(async () => {
    try {
      setLoading(true);

      const res = await callApi({
        url: `/user/port/${selectedStation[0]._id}`,
        method: "get",
      });

      if (res.success) {
        setPorts(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching ports", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStation]);

  useEffect(() => {
    if (selectedStation?.length > 0) {
      fetchPorts();
    }
  }, [fetchPorts, selectedStation]);

  return (
    <div className={styles.stationDetailsContainer}>
      {/* TOP TITLE ROW */}
      <div className={styles.titleRow}>
        <button className={styles.backButton} onClick={goBackToList}>
          ←
        </button>

        <h2 className={styles.detailsTitle}>
          {selectedStation[0].stationName}
        </h2>
      </div>

      {/* INFO BLOCK */}
      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Station ID:</span>
          <span className={styles.value}>{selectedStation[0].stationId}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Address:</span>
          <span className={styles.value}>{selectedStation[0].address}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>
            {selectedStation[0].stationEmail}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Mobile:</span>
          <span className={styles.value}>
            +91 {selectedStation[0].stationMobile}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Timing:</span>
          <span className={styles.value}>
            {formatTime(selectedStation[0].openTime)} –{" "}
            {formatTime(selectedStation[0].closeTime)}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label} style={{ textWrap: "nowrap" }}>
            Vehicle Types:
          </span>
          <div className={styles.badgeContainer}>
            {selectedStation[0]?.vehicleType?.length > 0 ? (
              selectedStation[0]?.vehicleType?.map((v, idx) => (
                <span key={idx} className={styles.badge}>
                  {v}
                </span>
              ))
            ) : (
              <p>-</p>
            )}
          </div>
        </div>
      </div>

      <h3 className={styles.portHeader}>Charging Ports</h3>

      <div className={styles.accordionWrapper}>
        {loading && <p>Loading ports...</p>}
        {!loading && ports.length === 0 && <p>No ports available</p>}

        <div className={styles.accordionContainer}>
          {ports.map((p, index) => (
            <div key={p._id} className={styles.accordionItem}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleAccordion(index)}
              >
                <span>🔌 {p.portType}</span>
                <span
                  className={`${styles.icon} ${
                    openIndex === index ? styles.rotateIcon : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              <div
                className={`${styles.accordionContent} ${
                  openIndex === index ? styles.open : ""
                }`}
              >
                <div className={styles.portDetails}>
                  <p>Total Ports: {p.totalPorts}</p>
                  <p>Available: {p.availablePorts}</p>
                  <p>In Use: {p.inUsePorts}</p>
                  <p>Price: ₹{p.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.bookBtn} onClick={handleBookingOnClick}>
        ⚡ Book a Charging Slot
      </button>

      {showModal && (
        <BookingModal
          closeModal={() => setShowModal(false)}
          station={selectedStation[0]}
          ports={ports}
        />
      )}
    </div>
  );
};

export default React.memo(StationViewDetailsCard);
