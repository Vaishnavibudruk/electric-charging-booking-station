import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getDistance } from "../../utils/CustomFunctions";
import { getRoute } from "../../config/getRouting";
import MapButtonLayer from "./layer/MapButtonLayer";
import InstructionPanel from "./instructionPanel/InstructionPanel";
import styles from "./MapView.module.css";
import AOS from "aos";
import "aos/dist/aos.css";
import MapIcon from "./mapIcon/MapIcon";
import { terrainMapStyle } from "../../constant/StringConstants";

const MapView = ({
  stations,
  userLocation,
  setUserLocation,
  selectedStation,
  routeInstructions,
  setRouteInstructions,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const userMarker = useRef(null);
  const stationMarkers = useRef([]);
  const routeLayerId = "routeLine";

  const [currentRoute, setCurrentRoute] = useState(null);
  const [mapStyle, setMapStyle] = useState(terrainMapStyle);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  /** Initialize Map **/
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [0, 0],
      zoom: 13,
    });
  }, [mapStyle]);

  /** Change Map Style Dynamically **/
  useEffect(() => {
    if (!map.current) return;

    // Switch style
    map.current.setStyle(mapStyle);

    // Once style loaded, re-add route and markers
    map.current.once("styledata", () => {
      // Re-add route if exists
      if (currentRoute) {
        addRoute(currentRoute.destination);
      }

      // Re-add station markers
      addStationMarkers(stations);
    });
  }, [mapStyle]);

  /** Watch user location **/
  useEffect(() => {
    if (!map.current) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });

        // Update marker
        if (!userMarker.current) {
          userMarker.current = new maplibregl.Marker({ color: "red" })
            .setLngLat([lng, lat])
            .addTo(map.current);
        } else {
          userMarker.current.setLngLat([lng, lat]);
        }

        // Smooth center movement
        map.current.easeTo({ center: [lng, lat], duration: 800 });

        // Update route dynamically if active
        if (currentRoute?.destination) {
          addRoute(currentRoute.destination, [lng, lat]);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 1000, distanceFilter: 1 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentRoute, setUserLocation]);

  /** Update Station Markers **/
  const addStationMarkers = (stationList) => {
    if (!map.current) return;

    stationMarkers.current.forEach((m) => m.remove());
    stationMarkers.current = [];

    if (!stationList || stationList.length === 0) return;

    stationList.forEach((s) => {
      const [lng, lat] = s.stationCoordinates.coordinates;

      const markerColor =
        selectedStation?.length && selectedStation[0]._id === s._id
          ? "green"
          : "blue";

      const marker = new maplibregl.Marker({ color: markerColor })
        .setLngLat([lng, lat])
        .addTo(map.current);
      stationMarkers.current.push(marker);

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
      });

      marker.getElement().addEventListener("mouseenter", () => {
        if (userLocation) {
          const dist = getDistance(
            userLocation.lat,
            userLocation.lng,
            lat,
            lng
          );
          popup.setHTML(
            `<b>${s.stationName}</b><br>Distance: ${
              dist >= 1000
                ? (dist / 1000).toFixed(2) + " km"
                : dist.toFixed(0) + " m"
            }`
          );
        } else {
          popup.setHTML(`<b>${s.stationName}</b>`);
        }
        popup.setLngLat([lng, lat]).addTo(map.current);
      });

      marker.getElement().addEventListener("mouseleave", () => popup.remove());

      marker.getElement().addEventListener("click", async () => {
        if (!userLocation) return alert("User location unknown");

        setCurrentRoute({ destination: [lng, lat] });
        addRoute([lng, lat], [userLocation.lng, userLocation.lat]);
      });
    });
  };

  /** Add or update route layer **/
  const addRoute = async (destination, fromCoords) => {
    if (!map.current) return;

    if (!userLocation) return;

    const start = fromCoords || [userLocation.lng, userLocation.lat];
    const routeGeoJSON = await getRoute(start, destination);
    if (!routeGeoJSON) return;

    // Remove old route
    if (map.current.getLayer(routeLayerId))
      map.current.removeLayer(routeLayerId);
    if (map.current.getSource(routeLayerId))
      map.current.removeSource(routeLayerId);

    // Add new route
    map.current.addSource(routeLayerId, {
      type: "geojson",
      data: routeGeoJSON,
    });

    map.current.addLayer({
      id: routeLayerId,
      type: "line",
      source: routeLayerId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#1A73E8", "line-width": 4 },
    });

    // Update instructions
    const steps =
      routeGeoJSON.features[0]?.properties?.segments?.[0]?.steps || [];
    setRouteInstructions(steps);

    // Fit bounds
    const bounds = new maplibregl.LngLatBounds();
    routeGeoJSON.features[0].geometry.coordinates.forEach(([x, y]) =>
      bounds.extend([x, y])
    );
    map.current.fitBounds(bounds, { padding: 80 });
  };

  /** Watch selectedStation changes **/
  useEffect(() => {
    if (!selectedStation || selectedStation.length === 0) {
      // Remove route if no station selected
      if (map.current.getLayer(routeLayerId))
        map.current.removeLayer(routeLayerId);
      if (map.current.getSource(routeLayerId))
        map.current.removeSource(routeLayerId);

      // Smooth move to user location
      if (userLocation?.lat && userLocation?.lng) {
        map.current.easeTo({
          center: [userLocation.lng, userLocation.lat],
          duration: 800,
        });
      }
    } else {
      const [lng, lat] = selectedStation[0].stationCoordinates.coordinates;
      setCurrentRoute({ destination: [lng, lat] });
      addRoute([lng, lat]);
    }
  }, [selectedStation]);

  // Update station markers whenever stations or selectedStation changes
  useEffect(() => {
    addStationMarkers(stations);
  }, [stations, selectedStation, userLocation]);

  return (
    <div className={styles.container} data-aos="zoom-in">
      <div ref={mapContainer} style={{ flex: 1 }} />

      {/* Map Button Layer Satellite and Terrain */}
      <MapButtonLayer setMapStyle={setMapStyle} mapStyle={mapStyle} />

      {/* Go to My Location Button */}
      <MapIcon
        routeInstructions={routeInstructions}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
        map={map}
      />

      {/* Navigation Instructions Panel */}
      {routeInstructions.length > 0 && (
        <InstructionPanel routeInstructions={routeInstructions} />
      )}
    </div>
  );
};

export default React.memo(MapView);
