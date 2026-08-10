import React, { useEffect, useState, useCallback } from "react";
import styles from "./YourBookingScreen.module.css";
import Navbar from "../../components/navbar/Navbar";
import { callApi } from "../../config/axiosConfig";
import {
  FaChevronDown,
  FaChevronUp,
  FaPlug,
  FaClock,
  FaSearch,
} from "react-icons/fa";
import { generateInvoicePDF } from "../../utils/CustomFunctions";

const YourBookingScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("user-authentication-token");

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const getBookings = useCallback(async () => {
    const response = await callApi({
      method: "get",
      url: "/booking/user-bookings",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.success) setBookings(response.data.data);
  }, [token]);

  const handleCancelBooking = useCallback(async (item) => {
    const response = await callApi({
      method: "put",
      url: "/booking/cancel-booking/" + item._id,
    });

    if (response.success) {
      alert(response.data.message);
    }
  }, []);

  useEffect(() => {
    getBookings();
  }, [getBookings]);

  // Filter bookings based on search term
  const filteredBookings = bookings.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.stationId.stationName.toLowerCase().includes(term) ||
      item.userName.toLowerCase().includes(term) ||
      item._id.toLowerCase().includes(term)
    );
  });

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={`${styles.container} container`}>
        <h2 className={styles.title}>Your Charging History</h2>

        {/* Search Field */}
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by Station, User, or Booking ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {filteredBookings.length === 0 ? (
          <p className={styles.noData}>No bookings found.</p>
        ) : (
          <div className={styles.accordionGrid}>
            {filteredBookings.map((item) => {
              const isOpen = openId === item._id;

              return (
                <div key={item._id} className={styles.accordionCard}>
                  {/* Accordion Header */}
                  <div
                    className={styles.accordionHeader}
                    onClick={() => toggleAccordion(item._id)}
                  >
                    <div className={styles.headerLeft}>
                      <FaPlug className={styles.iconPlug} />
                      <div className={styles.textContainer}>
                        <h4 className={styles.stationName}>
                          {item.stationId.stationName}
                        </h4>
                        <p className={styles.dateText}>
                          <FaClock />
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className={styles.headerRight}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[item.bookingStatus.toLowerCase()]
                        }`}
                      >
                        {item.bookingStatus}
                      </span>
                      {isOpen ? (
                        <FaChevronUp className={styles.chevron} />
                      ) : (
                        <FaChevronDown className={styles.chevron} />
                      )}
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className={styles.accordionBody}>
                      <div className={styles.infoRow}>
                        <strong>Booking Id:</strong> {item._id}
                      </div>
                      <div className={styles.infoRow}>
                        <strong>Name:</strong> {item.userName}
                      </div>
                      <div className={styles.infoRow}>
                        <strong>Email:</strong> {item.userEmail}
                      </div>
                      <div className={styles.infoRow}>
                        <strong>Mobile:</strong> {item.userMobile}
                      </div>
                      <div className={styles.infoRow}>
                        <strong>Port Type:</strong> {item.port_Id.portType}
                      </div>
                      <div className={styles.infoRow}>
                        <strong>Total Units:</strong> {item.units} kWh
                      </div>
                      <div className={styles.infoRow}>
                        <strong>Price Per Unit:</strong> ₹{item.pricePerUnit}
                      </div>
                      <div className={styles.infoRow}>
                        <strong>Total Amount:</strong> ₹{item.totalPrice}
                      </div>
                      <div className={styles.infoRow}>
                        <strong>Payment Mode:</strong> {item.paymentMode}
                      </div>
                      <div
                        className={`${styles.infoRow} ${
                          item.paymentStatus === "PAID"
                            ? "text-success"
                            : "text-danger"
                        } `}
                      >
                        <strong>Payment Status:</strong> {item.paymentStatus}
                      </div>

                      {item.paymentStatus === "PAID" && (
                        <button
                          className={styles.invoiceBtn}
                          onClick={() => generateInvoicePDF(item)}
                        >
                          View Invoice
                        </button>
                      )}

                      {item.paymentStatus !== "PAID" &&
                        item.bookingStatus !== "CANCELLED" && (
                          <button
                            className={styles.cancelBtn}
                            onClick={() => handleCancelBooking(item)}
                          >
                            Cancel Booking
                          </button>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(YourBookingScreen);
