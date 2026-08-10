import React, { useState, useEffect } from "react";
import styles from "./BookingModal.module.css";
import { callApi } from "../../../config/axiosConfig";
import { useCallback } from "react";
import { getMinDateTime } from "../../../utils/CustomFunctions";
import {
  validateBooking,
  validateEmail,
  validateMobileNumber,
  validateUserName,
} from "../../../utils/validation";

const BookingModal = ({ closeModal, station, ports }) => {
  const token = localStorage.getItem("user-authentication-token");
  const [form, setForm] = useState({
    user_id: "",
    userName: "",
    userEmail: "",
    userMobile: "",
    port_Id: "",
    units: 1,
    vehicleType: "",
    paymentMode: "OFFLINE",
    expectedArrivalTime: "",
    estimatedChargingDuration: "",
  });

  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [existingBookingInfo, setExistingBookingInfo] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Submit booking
  const handleSubmit = async () => {
    try {
      if (
        !form.port_Id ||
        !form.expectedArrivalTime ||
        !form.estimatedChargingDuration ||
        !form.vehicleType
      ) {
        alert("All fields are required");
        return;
      }

      const nameError = validateUserName(form.userName);
      if (nameError) return alert(nameError);

      const emailError = validateEmail(form.userEmail);
      if (emailError) return alert(emailError);

      const mobileError = validateMobileNumber(form.userMobile);
      if (mobileError) return alert(mobileError);

      const error = validateBooking({
        expectedArrivalTime: form.expectedArrivalTime,
        estimatedChargingDuration: form.estimatedChargingDuration,
        paymentMode: form.paymentMode,
        waitingCount: existingBookingInfo?.waitingCount || 0,
      });

      if (error) {
        alert(error);
        return;
      }

      const confirm = window.confirm("Are you sure, you want to book?");
      if (!confirm) {
        return;
      }

      const res = await callApi({
        url: "/booking/create",
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          ...form,
          stationId: station._id,
          totalPrice: totalPrice.toFixed(2),
          pricePerUnit: pricePerUnit.toFixed(2),
        },
      });

      if (res.success) {
        if (form.paymentMode === "ONLINE") {
          handleRazorpayPayment(res.data);
        } else {
          alert(res.message || "Booking created!");
        }

        closeModal();
      }
    } catch (err) {
      console.error("Error booking slot", err);
    }
  };

  // Razorpay
  const handleRazorpayPayment = (paymentData) => {
    const selectedPort = ports.find((p) => p._id === form.port_Id);
    const { bookingId, order } = paymentData;

    const options = {
      key: "rzp_test_ats3Jzkgu2gDAq",
      amount: order.amount,
      currency: order.currency,
      name: station.stationName,
      order_id: order.id,

      handler: async function (response) {
        await callApi({
          url: "/booking/verify-payment",
          method: "post",
          data: {
            ...response,
            bookingId,
            stationId: station._id,
            portType: selectedPort.portType,
            userEmail: form.userEmail,
            vehicleType: form.vehicleType,
          },
        });

        alert("Payment Verified!");
      },

      modal: {
        ondismiss: async function () {
          // USER CLOSED PAYMENT WINDOW
          await callApi({
            url: "/booking/cancel-payment",
            method: "post",
            data: { bookingId },
          });

          alert("Payment cancelled. Booking removed.");
        },
      },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  const fetchDynmicPricing = useCallback(async () => {
    const res = await callApi({
      url: "/booking/calculate",
      method: "post",
      data: {
        stationId: station._id,
        portId: form.port_Id,
        vehicleType: form.vehicleType,
      },
    });

    if (res.success) {
      setPricePerUnit(res.data.pricePerUnit);
      setTotalPrice(res.data.pricePerUnit * form.units);
    }
  }, [form.port_Id, form.units, form.vehicleType, station._id]);

  useEffect(() => {
    const selectedPort = ports.find((p) => p._id === form.port_Id);
    if (selectedPort && form.vehicleType) {
      fetchDynmicPricing();
    }
  }, [fetchDynmicPricing, form.port_Id, form.vehicleType, ports]);

  useEffect(() => {
    // ---- NEW API CALL FOR WAITING COUNT ----
    const fetchWaiting = async () => {
      if (
        !form.port_Id ||
        !form.expectedArrivalTime ||
        !form.estimatedChargingDuration
      )
        return;

      try {
        const res = await callApi({
          url: `/booking/slot-check`,
          method: "post",
          data: {
            stationId: station._id,
            portId: form.port_Id,
            arrivalTime: form.expectedArrivalTime,
            chargingMinutes: form.estimatedChargingDuration,
          },
        });

        setExistingBookingInfo(res.data);
      } catch (error) {
        console.error("Error fetching waiting count", error);
      }
    };

    fetchWaiting();
  }, [
    form.estimatedChargingDuration,
    form.expectedArrivalTime,
    form.port_Id,
    form.units,
    ports,
    station._id,
  ]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>Book a Charging Slot</h2>
          <button className={styles.closeBtn} onClick={closeModal}>
            ✕
          </button>
        </div>

        {/* Form Fields */}
        <div className={`container ${styles.formContainer}`}>
          <div>
            <label>User Name</label>
            <input
              className="form-control"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Row: Email + Mobile */}
          <div className="row">
            <div className="col-md-6 ">
              <label>Email</label>
              <input
                className="form-control"
                name="userEmail"
                value={form.userEmail}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="col-md-6">
              <label>Mobile</label>
              <input
                className="form-control"
                name="userMobile"
                value={form.userMobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <label>Vehicle Type</label>
              <select
                className="form-select"
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {station?.vehicleType?.map((p) => (
                  <option value={p} key={p._id}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 ">
              <label>Select Port</label>
              <select
                className="form-select"
                name="port_Id"
                value={form.port_Id}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {ports.map((p) => (
                  <option value={p._id} key={p._id}>
                    {p.portType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <label>Units (kWh)</label>
              <input
                type="number"
                className="form-control"
                name="units"
                min="1"
                value={form.units}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 ">
              <label>Expected Arrival Time</label>
              <input
                type="datetime-local"
                className="form-control"
                name="expectedArrivalTime"
                value={form.expectedArrivalTime}
                onChange={handleChange}
                min={getMinDateTime()}
                required
              />
            </div>
          </div>

          <div className="row">
            {/* Expected Arrival Time */}

            {/* Estimated Charging Duration */}
            <div className="col-md-6 ">
              <label style={{ textWrap: "nowrap" }}>
                Est. Charging Duration(minutes)
              </label>
              <input
                type="number"
                className="form-control"
                name="estimatedChargingDuration"
                min="1"
                placeholder="Enter duration in minutes"
                value={form.estimatedChargingDuration}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 ">
              <label>Payment Mode</label>
              <select
                className="form-select"
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                required
              >
                <option value="OFFLINE">Offline</option>
                <option
                  disabled={existingBookingInfo?.waitingCount > 0}
                  value="ONLINE"
                >
                  Online
                </option>
              </select>
            </div>
          </div>

          <div>
            <div className={styles.paymentRow}>
              {/* SLOT STATUS AREA */}
              {existingBookingInfo &&
                existingBookingInfo?.status !== "CONFIRMED" && (
                  <div className={styles.slotInfoBox}>
                    {/* Slot Availability Message */}
                    <p
                      className={
                        existingBookingInfo?.isSlotAvailable
                          ? styles.greenText
                          : styles.redText
                      }
                    >
                      {existingBookingInfo?.message}
                    </p>

                    {/* If conflict, show details */}
                    {!existingBookingInfo?.isSlotAvailable && (
                      <div className="row">
                        {/* Show next available time */}
                        {existingBookingInfo?.nextAvailableTime && (
                          <div className="col-md-6">
                            <p className={styles.orangeText}>
                              <strong>Next Available Time:</strong>{" "}
                              {new Date(
                                existingBookingInfo?.nextAvailableTime
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {/* Waiting users */}
                        <div className="col-md-6">
                          <p className={styles.blueText}>
                            <strong>People in Waiting Queue:</strong>{" "}
                            {existingBookingInfo?.waitingCount}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Row: PricePerUnit + TotalPrice */}
          <div className="row">
            <div className="col-md-6">
              <div className={styles.priceBox}>
                <p>Price per Unit:</p>
                <strong>₹{pricePerUnit.toFixed(2)}/unit</strong>
              </div>
            </div>

            <div className="col-md-6">
              <div className={styles.priceBox}>
                <p>Total Price:</p>
                <strong>₹{totalPrice.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={closeModal}>
            Cancel
          </button>

          <button className={styles.submitBtn} onClick={handleSubmit}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BookingModal);
