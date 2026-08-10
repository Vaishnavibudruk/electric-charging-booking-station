import React, { useState, useCallback } from "react";
import styles from "./MapButtonLayer.module.css";
import { AppAssets } from "../../../constant/AppAssets";
import { MdOutlineLayers } from "react-icons/md";
import {
  satelliteMapStyle,
  terrainMapStyle,
} from "../../../constant/StringConstants";

const mapTypes = [
  {
    key: "satellite",
    title: "Satellite",
    img: AppAssets.satelliteImg,
    style: satelliteMapStyle,
  },
  {
    key: "terrain",
    title: "Terrain",
    img: AppAssets.terrainImg,
    style: terrainMapStyle,
  },
];

const MapButtonLayer = ({ setMapStyle, mapStyle }) => {
  const [open, setOpen] = useState(false);
  const [selectedMapStyle, setSelectedMapStyle] = useState(mapTypes[1]);

  const handleMapStyleSelection = useCallback(
    (item) => {
      setMapStyle(item.style);
      setSelectedMapStyle(item);
    },
    [setMapStyle]
  );

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Mini Preview Button */}
      <div className={`${styles.menuItem} ${styles.preview}`}>
        <img src={selectedMapStyle?.img} alt="preview" />
        <div className={styles.label}>
          <MdOutlineLayers size={14} /> Layer
        </div>
      </div>

      {/* Horizontal strip (Google Maps style) */}
      {open && (
        <div className={styles.menuStrip}>
          {mapTypes?.map((item) => (
            <div
              key={item.key}
              className={`${styles.menuItem} ${
                mapStyle.includes(item.key) ? styles.active : ""
              }`}
              onClick={() => handleMapStyleSelection(item)}
            >
              <img src={item.img} alt={item.title} />
              <div className={styles.label}>{item.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(MapButtonLayer);
