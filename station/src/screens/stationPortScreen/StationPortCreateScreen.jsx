import React from "react";
import StationDetailsFormLayout from "../../components/form/stationDetailsForm/StationDetailsFormLayout";
import StationPortForm from "../../components/form/stationPortForm/StationPortForm";
import { callApi } from "../../config/axiosConfig";
import { useNavigate } from "react-router-dom";

const StationPortCreateScreen = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("station-authentication-token");

  const handleSubmit = async (ports) => {
    if (!ports.length) {
      alert("Please add at least one port.");
      return;
    }

    const response = await callApi({
      url: "/station/createPorts",
      method: "post",
      data: { ports },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      alert("All ports added successfully!");
      navigate("/dashboard");
    }
  };

  return (
    <StationDetailsFormLayout>
      <StationPortForm handleSubmit={handleSubmit} />
    </StationDetailsFormLayout>
  );
};

export default React.memo(StationPortCreateScreen);
