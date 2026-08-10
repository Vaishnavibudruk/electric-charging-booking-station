import React from "react";
import styles from "./StationCard.module.css";
import { formatTime } from "../../../utils/CustomFunctions";

const StationCard = ({ stationData, openDetails }) => {
  return (
    <div className={styles.resultsWrapper}>
      {stationData?.map((station) => (
        <div
          key={station._id}
          className={styles.stationCard}
          onClick={() => openDetails(station)}
        >
          <div className={styles.stationCardHeader}>
            <h3>{station.stationName}</h3>
            <span
              className={`${styles.statusBadge} ${
                station.isOpen ? styles.openStatus : styles.closedStatus
              }`}
            >
              {station.isOpen ? "Open" : "Closed"}
            </span>
          </div>

          <div className={styles.stationInfoRow}>
            📍 {station.address || "Not available"}
          </div>

          <div className={styles.stationInfoRow}>
            ⏱ {formatTime(station.openTime)} – {formatTime(station.closeTime)}
          </div>

          {station.distance && (
            <div className={styles.stationInfoRow}>📏 {station.distance}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(StationCard);
