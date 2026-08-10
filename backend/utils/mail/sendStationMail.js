const { transporter } = require("./mailTranspoter");

// Validate email format
const isValidEmail = (email) => {
  if (!email) return false;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

const sendStationMail = async (station, booking, portType, vehicleType) => {
  try {
    let targetEmail = null;

    // 1️⃣ Prefer Station Email
    if (isValidEmail(station.stationEmail)) {
      targetEmail = station.stationEmail;
    }

    // 2️⃣ Else fallback → Station Owner Email
    if (!targetEmail && isValidEmail(station.ownerEmail)) {
      targetEmail = station.ownerEmail;
    }

    if (!targetEmail) {
      console.log("❌ No valid email found for station");
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL,
      to: targetEmail,
      subject: `New Booking Created - ${booking.userName}`,
      html: `
        <h2>New Booking Received</h2>
        <p><strong>User:</strong> ${booking.userName}</p>
        <p><strong>Mobile:</strong> ${booking.userMobile}</p>
        <p><strong>Port:</strong> ${portType}</p>
        <p><strong>Vehicle Type:</strong> ${vehicleType}</p>
        <p><strong>Units:</strong> ${booking.units} kWh</p>
        <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>
        <p><strong>Payment Mode:</strong> ${booking.paymentMode}</p>

        <br/>
        <p>This is an automated notification.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Booking mail sent to:", targetEmail);
  } catch (err) {
    console.log("❌ Error sending station mail:", err);
  }
};

const sendCancellationMail = async (booking, reason = "") => {
  try {
    if (!isValidEmail(booking.userEmail)) {
      console.log("❌ No valid user email found for booking cancellation");
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL,
      to: booking.userEmail,
      subject: `Booking Cancelled - ${booking.userName}`,
      html: `
        <h2>Booking Cancelled</h2>
        <p>Hello <strong>${booking.userName}</strong>,</p>
        <p>Your booking scheduled on <strong>${
          booking.expectedArrivalTime
        }</strong> has been <strong>cancelled</strong>.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p><strong>Station:</strong> ${booking.stationName || "N/A"}</p>
        <p><strong>Port:</strong> ${booking.port_Id || "N/A"}</p>
        <p><strong>Vehicle Type:</strong> ${booking.vehicleType || "N/A"}</p>
        <p><strong>Units:</strong> ${booking.units} kWh</p>
        <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>
        <p><strong>Payment Mode:</strong> ${booking.paymentMode}</p>
        <br/>
        <p>This is an automated notification from your EV Charging platform.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Cancellation email sent to:", booking.userEmail);
  } catch (err) {
    console.log("❌ Error sending cancellation email:", err);
  }
};

module.exports = { sendStationMail, sendCancellationMail };
