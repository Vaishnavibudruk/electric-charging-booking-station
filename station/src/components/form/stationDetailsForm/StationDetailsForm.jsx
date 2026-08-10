import React, { useState, useCallback } from "react";
import styles from "./StationDetailsForm.module.css";
import { validateEmail, validateMobileNumber } from "../../../utils/validation";

const REQUIRED_FIELDS = [
  { name: "stationName", label: "Station Name", required: true },
  { name: "stationId", label: "Station ID", required: true },
  { name: "stationEmail", label: "Station Email", required: true },
  { name: "stationMobile", label: "Station Mobile", required: true },
  { name: "address", label: "Address", required: true },
  { name: "city", label: "City", required: true },
  { name: "state", label: "State", required: true },
  { name: "pincode", label: "Pincode", required: true },
];

/* ===========================
   REUSABLE INPUT COMPONENT
   =========================== */
const Input = ({ label, name, type = "text", onChange, full }) => (
  <div className={full ? styles.inputBoxFull : styles.inputBox}>
    <label>{label}</label>
    <input type={type} name={name} onChange={onChange} />
  </div>
);

const StationDetailsForm = ({ handleSubmit, submitButtonText }) => {
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const [formData, setFormData] = useState({ vehicleType: [] });

  const toggleVehicleType = (vt) => {
    setFormData((prev) => {
      const vehicleTypeArray = prev.vehicleType || [];
      const exists = vehicleTypeArray.includes(vt);

      return {
        ...prev,
        vehicleType: exists
          ? vehicleTypeArray.filter((x) => x !== vt)
          : [...vehicleTypeArray, vt],
      };
    });
  };

  /* ===========================
     INPUT HANDLER
     =========================== */
  const handleInput = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  /* ===========================
     COORDINATES HANDLER
     =========================== */
  const updateCoordinates = useCallback((lat, lng) => {
    setCoords({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      stationCoordinates: {
        type: "Point",
        coordinates: [Number(lng), Number(lat)], // [lng, lat]
      },
    }));
  }, []);

  /* ===========================
     LOCATION
     =========================== */
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        updateCoordinates(
          coords.latitude.toFixed(6),
          coords.longitude.toFixed(6)
        );
      },
      () => alert("Please allow location access")
    );
  }, [updateCoordinates]);

  /* ===========================
     VALIDATION
     =========================== */
  const validateForm = useCallback(() => {
    for (let field of REQUIRED_FIELDS) {
      if (!formData[field.name]?.trim()) {
        return `${field.label} is required`;
      }
    }

    const emailError = validateEmail(formData.stationEmail);
    if (emailError) return emailError;

    const mobileError = validateMobileNumber(formData.stationMobile);
    if (mobileError) return mobileError;

    if (!formData.stationCoordinates) {
      return "Station coordinates are required";
    }

    return null;
  }, [formData]);

  /* ===========================
     SUBMIT
     =========================== */
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const error = validateForm();
      if (error) {
        alert(error);
        return;
      }

      handleSubmit(formData);
    },
    [formData, handleSubmit, validateForm]
  );

  /* ===========================
     JSX
     =========================== */
  return (
    <div className={styles.formWrapper}>
      <h2 className={styles.title}>Station Details</h2>

      <form className={styles.form} onSubmit={onSubmit}>
        {/* Station Info */}
        <div className={styles.row}>
          <Input
            label="Station Name"
            name="stationName"
            onChange={handleInput}
          />
          <Input label="Station ID" name="stationId" onChange={handleInput} />
        </div>

        <div className={styles.row}>
          <Input
            label="Station Email"
            name="stationEmail"
            type="email"
            onChange={handleInput}
          />
          <Input
            label="Station Mobile"
            name="stationMobile"
            onChange={handleInput}
          />
        </div>

        <Input full label="Address" name="address" onChange={handleInput} />

        <div className={styles.row}>
          <Input label="City" name="city" onChange={handleInput} />
          <Input label="State" name="state" onChange={handleInput} />
          <Input label="Pincode" name="pincode" onChange={handleInput} />
        </div>

        {/* Coordinates */}
        <div className={styles.locationBox}>
          <label>Station Coordinates</label>

          <div className={styles.coordsRow}>
            <input
              type="number"
              step="0.000001"
              value={coords.lat}
              placeholder="Latitude"
              onChange={(e) => updateCoordinates(e.target.value, coords.lng)}
            />

            <input
              type="number"
              step="0.000001"
              value={coords.lng}
              placeholder="Longitude"
              onChange={(e) => updateCoordinates(coords.lat, e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={getLocation}
            className={styles.locationBtn}
          >
            📍 Get Current Location
          </button>
        </div>

        {/* Time */}
        <div className={styles.row}>
          <div className={styles.inputBox}>
            <label>Vehicle Types</label>

            <div className={styles.vehicleInput}>
              {["2W", "3W", "4W"].map((vt) => {
                const isActive = formData.vehicleType?.includes(vt);

                return (
                  <button
                    type="button"
                    key={vt}
                    className={`${styles.vehiclePill} ${
                      isActive ? styles.vehicleActive : ""
                    }`}
                    onClick={() => toggleVehicleType(vt)}
                  >
                    {vt}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Open Time"
            name="openTime"
            type="time"
            onChange={handleInput}
          />
          <Input
            label="Close Time"
            name="closeTime"
            type="time"
            onChange={handleInput}
          />
        </div>

        <button className={styles.submitBtn}>{submitButtonText}</button>
      </form>
    </div>
  );
};

export default React.memo(StationDetailsForm);
