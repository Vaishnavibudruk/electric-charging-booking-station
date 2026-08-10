import axios from "axios";

export const getRoute = async (start, end) => {
  // start and end: [lng, lat]
  const apiKey =
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjNmNjI5ZmFhNGIxZTRmN2ViNjZjYjI2NmQyMDQ2YjhjIiwiaCI6Im11cm11cjY0In0="; // sign up free
  const url =
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  try {
    const res = await axios.post(
      url,
      {
        coordinates: [start, end],
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data; // GeoJSON LineString
  } catch (err) {
    console.error("Route fetch error:", err);
    return null;
  }
};
