import React from "react";
import StationDetailsForm from "../../components/form/stationDetailsForm/StationDetailsForm";
import { callApi } from "../../config/axiosConfig";
import StationDetailsFormLayout from "../../components/form/stationDetailsForm/StationDetailsFormLayout";
import { useNavigate } from "react-router-dom";

const StationDetailsScreen = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("station-authentication-token");

  const handleSubmit = async (data) => {
    const response = await callApi({
      method: "post",
      url: "/station/createStationDetails",
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.success) return;

    alert(response.data.message);
    navigate("/details-port");
  };

  return (
    <StationDetailsFormLayout>
      <StationDetailsForm
        handleSubmit={handleSubmit}
        submitButtonText="Continue"
      />
    </StationDetailsFormLayout>
  );
};

export default React.memo(StationDetailsScreen);
