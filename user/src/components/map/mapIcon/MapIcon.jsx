import React from "react";
import styles from "../MapView.module.css";

const MapIcon = ({ routeInstructions, userLocation, setUserLocation, map }) => {
  return (
    <button
      className={`${
        routeInstructions?.length > 0 ? styles.right : styles.myLocationBtn
      }`}
      onClick={() => {
        if (userLocation?.lat && userLocation?.lng) {
          map.current.easeTo({
            center: [userLocation.lng, userLocation.lat],
            zoom: 15,
            duration: 800,
          });
        } else {
          // User location not available
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            },
            (err) => {}
          );
          alert("User location not available");
        }
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="22"
        width="22"
        viewBox="0 0 24 24"
        fill="white"
      >
        <path d="M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8m1-6h-2v3a7 7 0 0 0-7 7H1v2h3a7 7 0 0 0 7 7v3h2v-3a7 7 0 0 0 7-7h3v-2h-3a7 7 0 0 0-7-7z" />
      </svg>
    </button>
  );
};

export default React.memo(MapIcon);
