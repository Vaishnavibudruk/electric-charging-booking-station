import React from "react";
import styles from "./BookingScreen.module.css";
import Filters from "./components/filters/Filters";
import { useBookingScreen } from "./hooks/hooks";
import BookingTable from "./components/bookingTable/BookingTable";

const BookingScreen = () => {
  const {
    loading,
    filteredData,
    portTypes,
    openDropdown,
    filters,
    setSearchUser,
    setFilterPort,
    setFilterStatus,
    setFilterPayment,
    setFilterQueue,
    handleExportExcel,
    handleExportPdf,
    toggleDropdown,
    confirmBooking,
    updateBookingStatus,
    isPortFull,
    handleExportRevenuePdf,
    setFromDate,
    setToDate,
  } = useBookingScreen();

  if (loading)
    return (
      <h3 style={{ textAlign: "center", marginTop: "40px" }}>Loading...</h3>
    );

  return (
    <div className={styles.bookingScreenWrapper}>
      <h2 className={styles.title}>Booking Details</h2>

      {/* ---------------- FILTERS ---------------- */}
      <Filters
        filteredData={filteredData}
        portTypes={portTypes}
        filters={filters}
        setSearchUser={setSearchUser}
        setFilterPort={setFilterPort}
        setFilterStatus={setFilterStatus}
        setFilterPayment={setFilterPayment}
        setFilterQueue={setFilterQueue}
        handleExportExcel={handleExportExcel}
        handleExportPdf={handleExportPdf}
        setFromDate={setFromDate}
        setToDate={setToDate}
        handleExportRevenuePdf={handleExportRevenuePdf}
      />

      {/* ---------------- TABLE ---------------- */}
      <BookingTable
        filteredData={filteredData}
        toggleDropdown={toggleDropdown}
        isPortFull={isPortFull}
        confirmBooking={confirmBooking}
        openDropdown={openDropdown}
        updateBookingStatus={updateBookingStatus}
      />
    </div>
  );
};

export default React.memo(BookingScreen);
