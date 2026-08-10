import { useState, useCallback, useEffect, useMemo } from "react";
import { callApi } from "../../../../config/axiosConfig";
import {
  exportExcel,
  exportPDF,
  exportRevenuePDF,
  parseIndianDateTime,
} from "../../../../utils/customFunctions";

export const useBookingScreen = () => {
  // ---------------- STORAGE ----------------
  const stationId = localStorage.getItem("station-id");
  const token = localStorage.getItem("station-authentication-token");

  // ---------------- STATE ----------------
  const [bookings, setBookings] = useState([]);
  const [portList, setPortsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    port: "ALL",
    status: "ALL",
    payment: "ALL",
    queue: "ALL",
    fromDate: "",
    toDate: "",
  });

  // ---------------- FILTER UPDATERS ----------------
  const setSearchUser = (value) => setFilters((f) => ({ ...f, search: value }));

  const setFilterPort = (value) => setFilters((f) => ({ ...f, port: value }));

  const setFilterStatus = (value) =>
    setFilters((f) => ({ ...f, status: value }));

  const setFilterPayment = (value) =>
    setFilters((f) => ({ ...f, payment: value }));

  const setFilterQueue = (value) => setFilters((f) => ({ ...f, queue: value }));

  // ---------------- UNIQUE PORT TYPES ----------------
  const portTypes = useMemo(() => {
    return [
      ...new Set(bookings.map((b) => b.port_Id?.portType).filter(Boolean)),
    ];
  }, [bookings]);

  // ---------------- FILTERED LIST ----------------
  const filteredData = useMemo(() => {
    const searchLower = filters.search.toLowerCase();

    const hasDateFilter = filters.fromDate || filters.toDate;

    const from = filters.fromDate
      ? new Date(filters.fromDate + "T00:00:00")
      : null;

    const to = filters.toDate
      ? new Date(filters.toDate + "T23:59:59.999")
      : null;

    return bookings.filter((row) => {
      if (filters.port !== "ALL" && row.port_Id?.portType !== filters.port)
        return false;

      if (filters.status !== "ALL" && row.bookingStatus !== filters.status)
        return false;

      if (filters.payment !== "ALL" && row.paymentStatus !== filters.payment)
        return false;

      if (filters.queue === "ONLY_QUEUE" && !row.isWaiting) return false;
      if (filters.queue === "NON_QUEUE" && row.isWaiting) return false;

      if (filters.search && !row.userName?.toLowerCase().includes(searchLower))
        return false;

      // ✅ DATE FILTER ONLY WHEN USER SELECTS DATE
      if (hasDateFilter) {
        const bookingDate = parseIndianDateTime(row.startTime);
        console.log("bookingDate: ", bookingDate);

        // ❗ If date filter is active and date is missing → EXCLUDE
        if (!bookingDate) return false;

        if (from && bookingDate < from) return false;
        if (to && bookingDate > to) return false;
      }

      return true;
    });
  }, [bookings, filters]);

  const dateWiseRevenue = useMemo(() => {
    const map = {};

    filteredData.forEach((b) => {
      // Only consider PAID bookings
      if (b.paymentStatus !== "PAID") return;

      const dateObj = parseIndianDateTime(b.startTime);
      if (!dateObj) return;

      const dateKey = dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      if (!map[dateKey]) {
        map[dateKey] = {
          totalOffline: 0,
          totalOnline: 0,
          totalPayment: 0,
        };
      }

      const amount = Number(b.totalPrice || 0);

      if (b.paymentMode === "OFFLINE") {
        map[dateKey].totalOffline += amount;
      }

      if (b.paymentMode === "ONLINE") {
        map[dateKey].totalOnline += amount;
      }

      map[dateKey].totalPayment += amount;
    });

    return Object.entries(map)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);

  const handleExportRevenuePdf = useCallback(() => {
    exportRevenuePDF({
      dateWiseRevenue,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
  }, [dateWiseRevenue, filters]);

  // ---------------- EXPORT HANDLERS ----------------
  const handleExportExcel = useCallback(
    () => exportExcel({ filteredData, ...filters }),
    [filteredData, filters]
  );

  const handleExportPdf = useCallback(() => {
    exportPDF({ filteredData, ...filters });
  }, [filteredData, filters]);

  // ---------------- API: BOOKINGS ----------------
  const fetchBookings = useCallback(async () => {
    if (!stationId) return;

    try {
      const res = await callApi({
        url: `/booking/station/bookings/${stationId}`,
        method: "get",
      });

      if (!res.success) {
        return;
      }

      setBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  // ---------------- API: PORTS ----------------
  const getPorts = useCallback(async () => {
    try {
      const res = await callApi({
        method: "get",
        url: "/station/getPorts",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.success) setPortsList(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // ---------------- PORT FULL CHECK ----------------
  const isPortFull = useCallback(
    (portId) => {
      const port = portList.find((p) => p._id === portId);
      return port ? port.inUsePorts >= port.totalPorts : false;
    },
    [portList]
  );

  // ---------------- CONFIRM BOOKING ----------------
  const confirmBooking = async (bookingId) => {
    const ok = window.confirm("Confirm this booking?");
    if (!ok) return;

    try {
      const res = await callApi({
        url: `/booking/confirm-waiting/${bookingId}`,
        method: "put",
      });

      if (!res.success) return;

      alert("Booking confirmed!");
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- UPDATE STATUS ----------------
  const updateBookingStatus = async (bookingId, newStatus) => {
    const ok = window.confirm(`Update status to ${newStatus}?`);
    if (!ok) return;

    try {
      const res = await callApi({
        url: `/booking/update-status/${bookingId}`,
        method: "put",
        data: { bookingStatus: newStatus },
      });

      if (!res.success) return;

      // Update locally for instant UI response
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, bookingStatus: newStatus } : b
        )
      );

      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- DROPDOWN ----------------
  const toggleDropdown = (id) =>
    setOpenDropdown((prev) => (prev === id ? null : id));

  const setFromDate = (value) => setFilters((f) => ({ ...f, fromDate: value }));

  const setToDate = (value) => setFilters((f) => ({ ...f, toDate: value }));

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    getPorts();
  }, [getPorts]);

  return {
    bookings,
    loading,
    openDropdown,
    portList,
    portTypes,
    filteredData,

    // filters
    filters,
    setSearchUser,
    setFilterPort,
    setFilterStatus,
    setFilterPayment,
    setFilterQueue,
    setFromDate,
    setToDate,

    toggleDropdown,
    confirmBooking,
    updateBookingStatus,
    isPortFull,

    handleExportExcel,
    handleExportPdf,
    handleExportRevenuePdf,
  };
};
