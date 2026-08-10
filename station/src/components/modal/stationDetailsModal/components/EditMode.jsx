import React from "react";
import styles from "../StationDetailsModal.module.css";
import { callApi } from "../../../../config/axiosConfig";

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}) => (
  <div className={styles.formGroup}>
    <label>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);

const EditMode = ({
  formData,
  handleChange,
  setEditMode,
  setFormData,
  getStationDetails,
  token,
}) => {
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setFormData((prev) => ({
        ...prev,
        stationCoordinates: { type: "Point", coordinates: [lng, lat] },
      }));
    });
  };

  const saveStation = async () => {
    const response = await callApi({
      method: "put",
      url: "/station/updateStationDetails",
      data: formData,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.success) {
      setEditMode(false);
      getStationDetails();
    } else {
      alert("Update failed!");
    }
  };

  const toggleVehicleType = (vt) => {
    setFormData((prev) => {
      const exists = prev.vehicleType.includes(vt);
      return {
        ...prev,
        vehicleType: exists
          ? prev.vehicleType.filter((x) => x !== vt)
          : [...prev.vehicleType, vt],
      };
    });
  };

  return (
    <div className={styles.form}>
      {/* NAME + STATION ID */}
      <div className={styles.formRow}>
        <InputField
          label="Name"
          name="stationName"
          value={formData.stationName}
          onChange={handleChange}
        />
        <InputField
          label="Station ID"
          name="stationId"
          value={formData.stationId}
          onChange={handleChange}
        />
      </div>

      {/* EMAIL + MOBILE */}
      <div className={styles.formRow}>
        <InputField
          label="Email"
          name="stationEmail"
          value={formData.stationEmail}
          onChange={handleChange}
          type="email"
        />
        <InputField
          label="Mobile"
          name="stationMobile"
          value={formData.stationMobile}
          onChange={handleChange}
        />
      </div>

      {/* ADDRESS */}
      <InputField
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
      />

      {/* STATE + CITY + PINCODE */}
      <div className={styles.formRow}>
        <InputField
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
        />
        <InputField
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />
        <InputField
          name="pincode"
          placeholder="Pincode"
          value={formData.pincode}
          onChange={handleChange}
        />
      </div>

      {/* COORDINATES */}
      <label>Coordinates</label>
      <div className={styles.formRow}>
        <input
          type="number"
          value={formData.stationCoordinates?.coordinates?.[1] || ""}
          onChange={(e) => {
            const lat = parseFloat(e.target.value);
            setFormData((prev) => ({
              ...prev,
              stationCoordinates: {
                ...prev.stationCoordinates,
                coordinates: [
                  prev.stationCoordinates?.coordinates?.[0] || 0,
                  lat,
                ],
              },
            }));
          }}
          placeholder="Latitude"
        />

        <input
          type="number"
          value={formData.stationCoordinates?.coordinates?.[0] || ""}
          onChange={(e) => {
            const lng = parseFloat(e.target.value);
            setFormData((prev) => ({
              ...prev,
              stationCoordinates: {
                ...prev.stationCoordinates,
                coordinates: [
                  lng,
                  prev.stationCoordinates?.coordinates?.[1] || 0,
                ],
              },
            }));
          }}
          placeholder="Longitude"
        />

        <button
          type="button"
          className={styles.locationBtn}
          onClick={getLocation}
        >
          📍 Get Current Location
        </button>
      </div>

      {/* TIME + VEHICLE TYPES */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Vehicle Types</label>
          <div className={styles.vehicleTypeContainer}>
            {["2W", "3W", "4W"].map((vt) => (
              <label key={vt} className={styles.vehicleTypeOption}>
                <input
                  type="checkbox"
                  checked={formData.vehicleType.includes(vt)}
                  onChange={() => toggleVehicleType(vt)}
                />
                {vt}
              </label>
            ))}
          </div>
        </div>

        <InputField
          label="Open Time"
          name="openTime"
          type="time"
          value={formData.openTime}
          onChange={handleChange}
        />
        <InputField
          label="Close Time"
          name="closeTime"
          type="time"
          value={formData.closeTime}
          onChange={handleChange}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className={styles.btnRow}>
        <button className={styles.primaryBtn} onClick={saveStation}>
          Save Changes
        </button>
        <button className={styles.cancelBtn} onClick={() => setEditMode(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default React.memo(EditMode);
