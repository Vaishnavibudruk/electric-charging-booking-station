const { transporter } = require("./mailTranspoter");

const sendUserInvoiceMail = async (
  userEmail,
  booking,
  portType,
  vehicleType
) => {
  if (!userEmail || !userEmail.includes("@")) return;

  const htmlContent = `
    <h2>Payment Successful ✔</h2>
    <p>Thank you for your payment. Here is your invoice:</p>

    <h3>🔌 Booking Details</h3>
    <p><b>Booking ID:</b> ${booking._id}</p>
    <p><b>Port:</b> ${portType}</p>
    <p><b>vehicle Type :</b> ${vehicleType}</p>
    <p><b>Units:</b> ${booking.units}</p>
    <p><b>Price Per Unit:</b> ₹${booking.pricePerUnit}</p>
    <p><b>Total Amount Paid:</b> ₹${booking.totalPrice}</p>

    <h3>⏱ Timing</h3>
    <p><b>Start Time:</b> ${new Date(booking.startTime).toLocaleString()}</p>

    <hr/>
    <p style="font-size:14px;color:#555;">You can now go to the station and start charging.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Payment Invoice - EV Charging Booking",
    html: htmlContent,
  });
};

module.exports = { sendUserInvoiceMail };
