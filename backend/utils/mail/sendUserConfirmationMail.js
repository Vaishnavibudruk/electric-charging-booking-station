const { transporter } = require("./mailTranspoter");

const sendUserConfirmationMail = async (user, portType, station) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: user.userEmail,
    subject: "Your EV Charging Booking is Confirmed",
    html: `
      <h2>Your Booking is Confirmed 🎉</h2>

      <p>Hi <b>${user.userName}</b>,</p>

      <p>Your waiting queue booking is now <b>CONFIRMED</b>.</p>

      <h3>Booking Details</h3>
      <p><b>Station:</b> ${station.stationName}</p>
      <p><b>Address:</b> ${station.address}</p>
      <p><b>Port:</b> ${portType}</p>
      <p><b>Status:</b> PENDING</p>

      <br/>
      <p>Thank you for using EVBS ⚡</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendUserConfirmationMail };
