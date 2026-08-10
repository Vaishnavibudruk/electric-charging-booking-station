import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Generate File Name for Export
export const generateFileName = ({
  filterPort,
  filterStatus,
  filterPayment,
  filterQueue,
  searchUser,
}) => {
  let name = "Bookings";
  if (filterPort !== "ALL") name += `_Port-${filterPort}`;
  if (filterStatus !== "ALL") name += `_Status-${filterStatus}`;
  if (filterPayment !== "ALL") name += `_Payment-${filterPayment}`;
  if (filterQueue === "ONLY_QUEUE") name += `_QueueOnly`;
  if (searchUser?.trim() !== "") name += `_Search-${searchUser}`;
  return name.replace(/\s+/g, "-");
};

// PDF Export Logic
export const exportPDF = ({
  filteredData,
  filterPort = "allPorts",
  filterStatus = "allStatus",
  filterPayment = "allPayments",
  filterQueue = "allQueues",
  searchUser = "",
}) => {
  const doc = new jsPDF();
  doc.text("Booking Report", 14, 10);

  const columns = [
    "User",
    "Mobile",
    "Port",
    "kWh",
    "Amount",
    "Payment",
    "Status",
    "Start Time",
    "End Time",
    "Queue",
  ];

  const rows = filteredData.map((row) => [
    row.userName,
    row.userMobile,
    row.port_Id.portType,
    row.units,
    row.totalPrice,
    row.paymentStatus,
    row.bookingStatus,
    row.startTime ? new Date(row.startTime).toLocaleString() : "-",
    row.endTime ? new Date(row.endTime).toLocaleString() : "-",
    row.waitingQueuePosition ?? "-",
  ]);

  doc.autoTable({
    head: [columns],
    body: rows,
    startY: 20,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 86, 179] },
  });

  doc.save(
    generateFileName({
      filterPort,
      filterStatus,
      filterPayment,
      filterQueue,
      searchUser,
    }) + ".pdf"
  );
};

// ---------------- EXPORT EXCEL LOGIC ----------------
export const exportExcel = ({
  filteredData,
  filterPort,
  filterStatus,
  filterPayment,
  filterQueue,
  searchUser,
}) => {
  const worksheet = XLSX.utils.json_to_sheet(filteredData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  saveAs(
    new Blob([excelBuffer], { type: "application/octet-stream" }),
    generateFileName({
      filterPort,
      filterStatus,
      filterPayment,
      filterQueue,
      searchUser,
    }) + ".xlsx"
  );
};

// ---------------- EXPORT REVENUE PDF LOGIC ----------------
export const exportRevenuePDF = ({ dateWiseRevenue, fromDate, toDate }) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Date Wise Revenue Report", 14, 15);

  doc.setFontSize(10);
  doc.text(`From: ${fromDate || "ALL"}   To: ${toDate || "ALL"}`, 14, 22);

  const tableData = dateWiseRevenue.map((d, index) => [
    index + 1,
    d.date,
    `Rs. ${d.totalOffline.toFixed(2)}`,
    `Rs. ${d.totalOnline.toFixed(2)}`,
    `Rs. ${d.totalPayment.toFixed(2)}`,
  ]);

  doc.autoTable({
    startY: 30,
    head: [
      [
        "S.No",
        "Date",
        "Total Offline Payment",
        "Total Online Payment",
        "Total Payment",
      ],
    ],
    body: tableData,
    styles: { halign: "center", fontSize: 9 },
    headStyles: { fillColor: [42, 82, 152] },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 35 },
    },
  });

  doc.save("date-wise-revenue.pdf");
};

export const parseIndianDateTime = (value) => {
  if (!value) return null;

  // ✅ If already a Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // ✅ ISO format (2025-12-14T11:45:38.847Z)
  if (typeof value === "string" && value.includes("T")) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  // ✅ Indian format: "23/12/2025, 17:42:37"
  if (typeof value === "string" && value.includes(",")) {
    const parts = value.split(", ");
    if (parts.length !== 2) return null;

    const [datePart, timePart] = parts;
    const [day, month, year] = datePart.split("/").map(Number);

    if (!day || !month || !year) return null;

    const iso = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}T${timePart}`;

    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};
