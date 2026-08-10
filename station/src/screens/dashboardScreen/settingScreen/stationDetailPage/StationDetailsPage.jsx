import React, { useCallback } from "react";
import StationDetailsForm from "../../../../components/form/stationDetailsForm/StationDetailsForm";

const StationDetailsPage = () => {
  const handleSubmit = useCallback(() => {}, []);
  return (
    <>
      <StationDetailsForm
        handleSubmit={handleSubmit}
        submitButtonText="Update"
      />
    </>
  );
};

export default React.memo(StationDetailsPage);
