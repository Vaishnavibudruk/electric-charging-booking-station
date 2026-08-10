import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Check if a station is OPEN or CLOSED based on timing
export const checkIsStationOpen = (open, close) => {
  if (!open || !close) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = open.split(":").map(Number);
  const [closeH, closeM] = close.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  // Case 1: Normal (07:00 → 23:00)
  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  // Case 2: Over midnight (22:00 → 06:00)
  return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
};

export const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  const [h, m] = timeStr.split(":");
  let hour = Number(h);
  const minute = Number(m);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

export const generateInvoicePDF = (item) => {
  const doc = new jsPDF();

  // ====== HEADER ======
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("EV Charging Invoice", 105, 20, { align: "center" });

  // Line
  doc.setLineWidth(0.5);
  doc.line(20, 27, 190, 27);

  // ====== INVOICE META ======
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice ID: ${item._id}`, 20, 40);
  doc.text(`Invoice Date: ${new Date().toLocaleString()}`, 20, 48);

  // ====== USER DETAILS TABLE ======
  autoTable(doc, {
    startY: 60,
    head: [["User Details", ""]],
    body: [
      ["Name", item.userName],
      ["Email", item.userEmail],
      ["Mobile", item.userMobile],
    ],
    theme: "grid",
    styles: { fontSize: 11, cellPadding: 5 },
    headStyles: { fillColor: [0, 150, 255], textColor: 255 },
  });

  // ====== STATION DETAILS TABLE ======
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Charging Station", ""]],
    body: [
      ["Station Name", item.stationId.stationName],
      ["Port Type", item.port_Id.portType],
      ["Booking Date", new Date(item.createdAt).toLocaleString()],
    ],
    theme: "grid",
    styles: { fontSize: 11, cellPadding: 5 },
    headStyles: { fillColor: [0, 150, 120], textColor: 255 },
  });

  // ====== BILLING TABLE ======
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Description", "Amount"]],
    body: [
      ["Units (kWh)", `${item.units}`],
      ["Price Per Unit", `INR ${item.pricePerUnit}`],
      ["Payment Mode", item.paymentMode],
      ["Payment Status", item.paymentStatus],
      ["Total Amount", `INR ${item.totalPrice}`],
    ],
    theme: "striped",
    styles: { fontSize: 12, cellPadding: 6 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    bodyStyles: { textColor: [0, 0, 0] },
  });

  // ====== FOOTER ======
  doc.setFontSize(11);
  doc.text(
    "Thank you for using our EV Charging Service!",
    105,
    doc.lastAutoTable.finalY + 20,
    { align: "center" }
  );

  doc.save(`Invoice-${item._id}.pdf`);
};

export const getMinDateTime = () => {
  const now = new Date();

  // Convert to local ISO without timezone shift bugs
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
