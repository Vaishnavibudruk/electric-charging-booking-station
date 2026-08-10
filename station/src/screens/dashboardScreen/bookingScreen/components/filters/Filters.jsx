import React, { memo } from "react";
import styles from "./Filters.module.css";

const Select = ({ value, onChange, options }) => (
  <div className={styles.selectWrapper}>
    <select className={styles.select} value={value} onChange={onChange}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ color: "red" }}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const Filters = ({
  filteredData,
  filters,
  portTypes,
  setSearchUser,
  setFilterPort,
  setFilterStatus,
  setFilterPayment,
  setFilterQueue,
  handleExportExcel,
  handleExportPdf,
  setFromDate,
  setToDate,
  handleExportRevenuePdf,
}) => {
  const portOptions = [
    { value: "ALL", label: "All Ports" },
    ...portTypes.map((port) => ({ value: port, label: port })),
  ];

  const statusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "INPROGRESS", label: "In Progress" },
    { value: "PENDING", label: "Pending" },
    { value: "COMPLETED", label: "Completed" },
    { value: "WAITING", label: "Waiting" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const paymentOptions = [
    { value: "ALL", label: "All Payments" },
    { value: "PAID", label: "Paid" },
    { value: "PENDING", label: "Pending" },
  ];

  const queueOptions = [
    { value: "ALL", label: "All Booking Types" },
    { value: "NON_QUEUE", label: "Booked" },
    { value: "ONLY_QUEUE", label: "Waiting" },
  ];

  const isButtonDisabled = !filteredData.length;

  return (
    <div className={styles.filterBar}>
      <input
        type="text"
        placeholder="Search by user name"
        value={filters?.search}
        onChange={(e) => setSearchUser(e.target.value)}
        className={styles.input}
      />

      <Select
        value={filters?.port}
        onChange={(e) => setFilterPort(e.target.value)}
        options={portOptions}
      />

      <Select
        value={filters?.status}
        onChange={(e) => setFilterStatus(e.target.value)}
        options={statusOptions}
      />

      <Select
        value={filters?.payment}
        onChange={(e) => setFilterPayment(e.target.value)}
        options={paymentOptions}
      />

      <Select
        value={filters?.queue}
        onChange={(e) => setFilterQueue(e.target.value)}
        options={queueOptions}
      />

      <input
        type="date"
        value={filters.fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className={styles.input}
      />

      <input
        type="date"
        value={filters.toDate}
        onChange={(e) => setToDate(e.target.value)}
        className={styles.input}
      />

      <button
        className={styles.exportBtn}
        onClick={handleExportRevenuePdf}
        disabled={!filteredData.length}
      >
        Export Revenue PDF
      </button>

      <button
        className={styles.exportBtn}
        onClick={handleExportExcel}
        disabled={isButtonDisabled}
      >
        Export Excel
      </button>

      <button
        className={styles.exportBtn}
        onClick={handleExportPdf}
        disabled={isButtonDisabled}
      >
        Export PDF
      </button>
    </div>
  );
};

export default memo(Filters);
