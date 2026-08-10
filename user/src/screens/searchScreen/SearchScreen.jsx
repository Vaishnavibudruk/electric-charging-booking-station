import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import MapView from "../../components/map/MapView";
import styles from "./SearchScreen.module.css";
import SearchSidebar from "../../components/searchSidebar/SearchSidebar";

const SearchScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [routeInstructions, setRouteInstructions] = useState([]);

  const handleResults = (stationsList, location = null) => {
    setStations(stationsList);
    if (location) setUserLocation(location);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }, []);

  return (
    <div className={styles.searchPageWrapper}>
      <div className={styles.navbarWrapper}>
        <Navbar />
      </div>

      <div className={styles.searchMapContainer}>
        <SearchSidebar
          stations={stations}
          userLocation={userLocation}
          setStations={setStations}
          onResults={handleResults}
          setSelectedStation={setSelectedStation}
          selectedStation={selectedStation}
          setRouteInstructions={setRouteInstructions}
          setUserLocation={setUserLocation}
        />
        <MapView
          stations={stations}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          selectedStation={selectedStation}
          routeInstructions={routeInstructions}
          setRouteInstructions={setRouteInstructions}
        />
      </div>
    </div>
  );
};

export default React.memo(SearchScreen);
