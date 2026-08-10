// Updated SearchSidebar.jsx with view state retention and proper back navigation
import React, { useState, useEffect } from "react";
import { FaSearch, FaLocationArrow } from "react-icons/fa";
import styles from "./SearchSidebar.module.css";
import { callApi } from "../../config/axiosConfig";
import { checkIsStationOpen, getDistance } from "../../utils/CustomFunctions";
import StationCard from "./stationCard/StationCard";
import StationViewDetailsCard from "./stationViewDetailsCard/StationViewDetailsCard";
import AOS from "aos";
import "aos/dist/aos.css";

const SearchSidebar = ({
  onResults,
  userLocation,
  setSelectedStation,
  selectedStation,
  setRouteInstructions,
  setUserLocation,
}) => {
  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list | details

  // Save previous state for restoring when back is pressed
  const [savedState, setSavedState] = useState({});

  const handleResults = (stations, userLoc) => {
    let finalData = stations;

    if (userLoc?.lat && userLoc?.lng) {
      finalData = stations.map((s) => {
        const dist = getDistance(
          userLocation.lat,
          userLocation.lng,
          s.stationCoordinates?.coordinates[1],
          s.stationCoordinates?.coordinates[0]
        );

        return {
          ...s,
          distance: `${(dist / 1000).toFixed(2)} km`,
          isOpen: checkIsStationOpen(s.openTime, s.closeTime),
        };
      });
    } else {
      finalData = stations.map((s) => ({
        ...s,
        isOpen: checkIsStationOpen(s.openTime, s.closeTime),
      }));
    }

    setResults(finalData);
    setNoData(finalData.length === 0);
    onResults(finalData, userLoc);
  };

  const handleSearchByName = async () => {
    if (!searchName.trim() && !searchLocation.trim()) {
      setResults([]);
      setNoData(false);
      onResults([], null);
      return;
    }

    setLoading(true);
    const res = await callApi({
      url: "/user/searchStations",
      method: "get",
      params: { name: searchName, address: searchLocation },
    });
    setLoading(false);

    if (res.success) handleResults(res.data.data);
  };

  const handleSearchByAddress = async () => {
    if (!searchName.trim() && !searchLocation.trim()) {
      setResults([]);
      setNoData(false);
      onResults([], null);
      return;
    }

    setLoading(true);
    const res = await callApi({
      url: "/user/searchStations",
      method: "get",
      params: { address: searchLocation, name: searchName },
    });
    setLoading(false);

    if (res.success) handleResults(res.data.data);
  };

  const handleUseCurrentLocation = async () => {
    if (!userLocation) {
      alert("Please enable location services.");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {}
      );
      return;
    }
    const res = await callApi({
      url: "/user/searchStations",
      method: "get",
      params: userLocation,
    });

    if (res.success) handleResults(res.data.data, userLocation);
  };

  const openDetails = (station) => {
    // Save current sidebar UI state
    setSavedState({
      searchName,
      searchLocation,
      results,
      noData,
    });
    setSelectedStation([station]);
    setViewMode("details");
  };

  const goBackToList = () => {
    // restore previous sidebar UI state
    if (savedState) {
      setRouteInstructions([]);
      setSearchName(savedState.searchName || "");
      setSearchLocation(savedState.searchLocation || "");
      setResults(savedState.results || []);
      setNoData(savedState.noData || false);
    }

    setViewMode("list");
    setSelectedStation([]);
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className={styles.sidebarContainer}>
      {viewMode === "list" && (
        <>
          <h2 className={styles.sidebarTitle}>Search Stations</h2>

          {/* Search by address */}
          <div className={styles.sidebarInputGroup}>
            <FaSearch className={styles.sidebarIcon} />
            <input
              type="text"
              placeholder="Search by location/address"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchByAddress()}
            />
          </div>

          {/* Search by name */}
          <div className={styles.sidebarInputGroup}>
            <FaSearch className={styles.sidebarIcon} />
            <input
              type="text"
              placeholder="Search by station name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchByName()}
            />
          </div>

          <button
            className={styles.sidebarCurrentLocationBtn}
            onClick={handleUseCurrentLocation}
          >
            <FaLocationArrow /> Use Current Location
          </button>

          {loading && <p className={styles.loadingText}>Searching...</p>}
          {noData && !loading && (
            <p className={styles.noDataFound}>No stations found</p>
          )}

          <StationCard stationData={results} openDetails={openDetails} />
        </>
      )}

      {/* DETAILS VIEW */}
      {viewMode === "details" && selectedStation?.length > 0 && (
        <StationViewDetailsCard
          goBackToList={goBackToList}
          selectedStation={selectedStation}
        />
      )}
    </div>
  );
};

export default React.memo(SearchSidebar);
