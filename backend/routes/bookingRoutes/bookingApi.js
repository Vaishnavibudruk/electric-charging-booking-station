const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const stationPortSchema = require("../../schema/stationSchema/stationPortSchema");
const userRegistrationSchema = require("../../schema/userSchema/userRegisterSchema");
const bookingSchema = require("../../schema/bookingSchema/bookingSchema");
const razorpay = require("../../config/razorpay");
const { AuthenticateUser } = require("../../utils/middleware/authenticateUser");
const stationDetailsSchema = require("../../schema/stationSchema/stationDetailsSchema");
const { sendStationMail } = require("../../utils/mail/sendStationMail");
const { sendUserInvoiceMail } = require("../../utils/mail/sendUserInvoiceMail");
const {
  sendUserConfirmationMail,
} = require("../../utils/mail/sendUserConfirmationMail");
const getDynamicPrice = require("../../utils/nodeJsPythonRunner/callPriceModal");
const mongoose = require("mongoose");

// CREATE BOOKING + RAZORPAY ORDER
// router.post(
//   "/create",
//   AuthenticateUser(userRegistrationSchema),
//   async (req, res) => {
//     const user_id = req.user._id;
//     try {
//       const {
//         userName,
//         userEmail,
//         userMobile,
//         stationId,
//         port_Id,
//         units,
//         paymentMode,
//       } = req.body;

//       const port = await stationPortSchema.findById(port_Id);
//       if (!port) return res.status(404).json({ message: "Port not found" });

//       const pricePerUnit = port.price;
//       const totalPrice = units * pricePerUnit;

//       // ------------------------------------
//       // CHECK PORT AVAILABILITY
//       // ------------------------------------
//       if (port.availablePorts <= 0) {
//         // Count existing waiting users
//         const waitingCount = await bookingSchema.countDocuments({
//           port_Id,
//           isWaiting: true,
//         });

//         const waitingBooking = await bookingSchema.create({
//           user_id,
//           userName,
//           userEmail,
//           userMobile,
//           stationId,
//           port_Id,
//           units,
//           pricePerUnit,
//           totalPrice,
//           paymentMode: "OFFLINE", // FORCE OFFLINE
//           paymentStatus: "PENDING",
//           bookingStatus: "WAITING",
//           isWaiting: true,
//           waitingQueuePosition: waitingCount + 1,
//         });

//         return res.json({
//           message: "All ports full! You are added to the waiting queue.",
//           yourPosition: waitingCount + 1,
//           data: waitingBooking,
//         });
//       }

//       // ------------------------------------
//       // NORMAL BOOKING (PORT AVAILABLE)
//       // ------------------------------------
//       if (paymentMode === "ONLINE") {
//         const razorOrder = await razorpay.orders.create({
//           amount: totalPrice * 100,
//           currency: "INR",
//           receipt: "rcpt_" + Date.now(),
//         });

//         const booking = await bookingSchema.create({
//           user_id,
//           userName,
//           userEmail,
//           userMobile,
//           stationId,
//           port_Id,
//           units,
//           pricePerUnit,
//           totalPrice,
//           paymentMode: "ONLINE",
//           paymentStatus: "PENDING",
//           bookingStatus: "PENDING",
//         });

//         // 🔥 Reduce available port temporarily
//         await stationPortSchema.findByIdAndUpdate(port_Id, {
//           $inc: { availablePorts: -1, inUsePorts: 1 },
//         });

//         return res.json({
//           message: "Order created. Complete payment.",
//           razorpayKey: process.env.RAZORPAY_KEY_ID,
//           order: razorOrder,
//           bookingId: booking._id,
//         });
//       }

//       // OFFLINE normal booking
//       const booking = await bookingSchema.create({
//         user_id,
//         userName,
//         userEmail,
//         userMobile,
//         stationId,
//         port_Id,
//         units,
//         pricePerUnit,
//         totalPrice,
//         paymentMode: "OFFLINE",
//         paymentStatus: "PENDING",
//         bookingStatus: "PENDING",
//       });

//       // 🔥 Reduce available ports immediately
//       await stationPortSchema.findByIdAndUpdate(port_Id, {
//         $inc: { availablePorts: -1, inUsePorts: 1 },
//       });

//       const station = await stationDetailsSchema.findById(stationId);
//       const { portType } = port;

//       sendStationMail(station, booking, portType);

//       res.json({ message: "Booking created successfully", data: booking });
//     } catch (err) {
//       console.log("err: ", err);
//       res.status(500).json({ message: "Error creating booking", err });
//     }
//   }
// );

// // VERIFY PAYMENT
// router.post("/verify-payment", async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       bookingId,
//       stationId,
//       portType,
//       userEmail,
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: "Invalid signature" });
//     }

//     // Update booking status after payment success
//     const booking = await bookingSchema.findByIdAndUpdate(
//       bookingId,
//       {
//         paymentStatus: "PAID",
//         bookingStatus: "INPROGRESS",
//         startTime: new Date(),
//       },
//       { new: true }
//     );

//     const station = await stationDetailsSchema.findById(stationId);
//     sendStationMail(station, booking, portType);

//     if (userEmail) {
//       await sendUserInvoiceMail(userEmail, booking, portType);
//     }

//     res.json({ message: "Payment Verified!", data: booking });
//   } catch (err) {
//     res.status(500).json({ message: "Error verifying payment", err });
//   }
// });

// router.post(
//   "/create",
//   AuthenticateUser(userRegistrationSchema),
//   async (req, res) => {
//     const user_id = req.user._id;

//     try {
//       const {
//         userName,
//         userEmail,
//         userMobile,
//         stationId,
//         port_Id,
//         units,
//         paymentMode,
//         vehicleType,
//         expectedArrivalTime,
//         estimatedChargingDuration, // hours or minutes? assuming HOURS
//         totalPrice,
//         pricePerUnit,
//       } = req.body;

//       if (!vehicleType)
//         return res.status(400).json({ error: "Vehicle type is required" });

//       if (!expectedArrivalTime || !estimatedChargingDuration)
//         return res.status(400).json({
//           error: "expectedArrivalTime & estimatedChargingDuration required",
//         });

//       const userArrival = new Date(expectedArrivalTime);
//       const userDurationMs = estimatedChargingDuration * 60 * 60 * 1000;

//       // --------------------------------------------------------
//       // 1. FETCH ALL BOOKINGS FOR THE PORT (timeline)
//       // --------------------------------------------------------
//       const existingBookings = await bookingSchema
//         .find({ stationId, port_Id })
//         .sort({ startTime: 1 });

//       // --------------------------------------------------------
//       // 2. IF NO BOOKINGS → user gets confirmed directly
//       // --------------------------------------------------------
//       if (existingBookings.length === 0) {
//         const start = userArrival;
//         const end = new Date(start.getTime() + userDurationMs);

//         return await createBookingEntry("CONFIRMED", start, end, 0);
//       }

//       // --------------------------------------------------------
//       // 3. BUILD OCCUPIED TIMELINE (actualStart → actualEnd)
//       // --------------------------------------------------------
//       let nextFree = new Date(existingBookings[0].startTime);

//       for (let b of existingBookings) {
//         const bStart = new Date(b.startTime);
//         const bEnd = new Date(b.endTime);

//         if (nextFree < bEnd) nextFree = new Date(bEnd);
//       }

//       // --------------------------------------------------------
//       // 4. CHECK IF USER CAN BE CONFIRMED
//       // --------------------------------------------------------
//       if (userArrival >= nextFree) {
//         const start = userArrival;
//         const end = new Date(start.getTime() + userDurationMs);

//         return await createBookingEntry("CONFIRMED", start, end, 0);
//       }

//       // --------------------------------------------------------
//       // 5. USER MUST WAIT (arrival < nextFree)
//       // --------------------------------------------------------
//       const waitingStart = new Date(nextFree);
//       const waitingEnd = new Date(waitingStart.getTime() + userDurationMs);

//       const waitingCount = await bookingSchema.countDocuments({
//         stationId,
//         port_Id,
//         isWaiting: true,
//       });

//       return await createBookingEntry(
//         "WAITING",
//         waitingStart,
//         waitingEnd,
//         waitingCount + 1
//       );

//       // --------------------------------------------------------
//       //  📌 Common Booking Creator Function
//       // --------------------------------------------------------
//       async function createBookingEntry(
//         status,
//         startTime,
//         endTime,
//         queuePosition
//       ) {
//         const isWaiting = status === "WAITING";

//         // ONLINE PAYMENT → Generate Razorpay Order
//         if (paymentMode === "ONLINE" && !isWaiting) {
//           const razorOrder = await razorpay.orders.create({
//             amount: totalPrice * 100,
//             currency: "INR",
//             receipt: "rcpt_" + Date.now(),
//           });

//           const booking = await bookingSchema.create({
//             user_id,
//             userName,
//             userEmail,
//             userMobile,
//             stationId,
//             port_Id,
//             units,
//             vehicleType,
//             pricePerUnit,
//             totalPrice,
//             paymentMode: "ONLINE",
//             paymentStatus: "PENDING",
//             bookingStatus: "PENDING",
//             isWaiting: false,
//             waitingQueuePosition: 0,
//             expectedArrivalTime: userArrival,
//             estimatedChargingDuration,
//             startTime,
//             endTime,
//           });

//           return res.json({
//             slotAvailable: true,
//             isWaiting: false,
//             message: "Order created. Complete payment.",
//             razorpayKey: process.env.RAZORPAY_KEY_ID,
//             order: razorOrder,
//             bookingId: booking._id,
//             startTime,
//             endTime,
//           });
//         }

//         // OFFLINE or WAITING BOOKINGS
//         const booking = await bookingSchema.create({
//           user_id,
//           userName,
//           userEmail,
//           userMobile,
//           stationId,
//           port_Id,
//           units,
//           vehicleType,
//           pricePerUnit,
//           totalPrice,
//           paymentMode: "OFFLINE",
//           paymentStatus: "PENDING",
//           bookingStatus: isWaiting ? "WAITING" : "PENDING",
//           isWaiting,
//           waitingQueuePosition: queuePosition,
//           expectedArrivalTime: userArrival,
//           estimatedChargingDuration,
//           startTime,
//           endTime,
//         });

//         return res.json({
//           slotAvailable: !isWaiting,
//           isWaiting,
//           message: isWaiting
//             ? `All ports busy. Added to waiting queue at position ${queuePosition}.`
//             : "Booking created successfully",
//           queuePosition,
//           startTime,
//           endTime,
//           data: booking,
//         });
//       }
//     } catch (err) {
//       console.error("Create booking error:", err);
//       return res.status(500).json({ error: "Booking creation failed", err });
//     }
//   }
// );

// router.post(
//   "/create",
//   AuthenticateUser(userRegistrationSchema),
//   async (req, res) => {
//     try {
//       const {
//         stationId,
//         port_Id,
//         expectedArrivalTime,
//         estimatedChargingDuration,
//         paymentMode,
//         totalPrice,
//         vehicleType,
//         userName,
//         userEmail,
//         userMobile,
//         units,
//         pricePerUnit,
//       } = req.body;
//       const user_id = req.user._id;

//       const newUserArrivalTime = new Date(expectedArrivalTime);
//       const expectedEndTime =
//         newUserArrivalTime.getTime() +
//         estimatedChargingDuration * 60 * 60 * 1000;

//       // 👉 Fetch port details (to get totalPorts)
//       const portData = await stationPortSchema.findOne({ _id: port_Id });
//       const totalPorts = portData.totalPorts;
//       let minEndBooking = null;

//       const existingBookingDetails = await bookingSchema.find({
//         stationId,
//         port_Id,
//       });

//       if (!existingBookingDetails) {
//         if (paymentMode === "ONLINE") {
//           const razorOrder = await razorpay.orders.create({
//             amount: totalPrice * 100,
//             currency: "INR",
//             receipt: "rcpt_" + Date.now(),
//           });

//           const booking = await bookingSchema.create({
//             user_id,
//             userName,
//             userEmail,
//             userMobile,
//             stationId,
//             port_Id,
//             units,
//             pricePerUnit,
//             totalPrice,
//             paymentMode: "ONLINE",
//             paymentStatus: "PENDING",
//             bookingStatus: "PENDING",
//             vehicleType,
//             expectedArrivalTime,
//             expectedEndTime,
//             estimatedChargingDuration,
//           });

//           // 🔥 Reduce available port temporarily
//           await stationPortSchema.findByIdAndUpdate(port_Id, {
//             $inc: { availablePorts: -1, inUsePorts: 1 },
//           });

//           return res.json({
//             message: "Order created. Complete payment.",
//             razorpayKey: process.env.RAZORPAY_KEY_ID,
//             order: razorOrder,
//             bookingId: booking._id,
//           });
//         }

//         // OFFLINE normal booking
//         const booking = await bookingSchema.create({
//           user_id,
//           userName,
//           userEmail,
//           userMobile,
//           stationId,
//           port_Id,
//           units,
//           pricePerUnit,
//           totalPrice,
//           paymentMode: "OFFLINE",
//           paymentStatus: "PENDING",
//           bookingStatus: "PENDING",
//           vehicleType,
//           expectedArrivalTime,
//           expectedEndTime,
//           estimatedChargingDuration,
//         });
//       } else {
//         if (totalPorts > existingBookingDetails.length) {
//           if (paymentMode === "ONLINE") {
//             const razorOrder = await razorpay.orders.create({
//               amount: totalPrice * 100,
//               currency: "INR",
//               receipt: "rcpt_" + Date.now(),
//             });

//             const booking = await bookingSchema.create({
//               user_id,
//               userName,
//               userEmail,
//               userMobile,
//               stationId,
//               port_Id,
//               units,
//               pricePerUnit,
//               totalPrice,
//               paymentMode: "ONLINE",
//               paymentStatus: "PENDING",
//               bookingStatus: "PENDING",
//             });

//             // 🔥 Reduce available port temporarily
//             await stationPortSchema.findByIdAndUpdate(port_Id, {
//               $inc: { availablePorts: -1, inUsePorts: 1 },
//             });

//             return res.json({
//               message: "Order created. Complete payment.",
//               razorpayKey: process.env.RAZORPAY_KEY_ID,
//               order: razorOrder,
//               bookingId: booking._id,
//             });
//           }

//           // OFFLINE normal booking
//           const booking = await bookingSchema.create({
//             user_id,
//             userName,
//             userEmail,
//             userMobile,
//             stationId,
//             port_Id,
//             units,
//             pricePerUnit,
//             totalPrice,
//             paymentMode: "OFFLINE",
//             paymentStatus: "PENDING",
//             bookingStatus: "PENDING",
//           });
//         } else {
//           for (let b of existingBookingDetails) {
//              if (b.expectedEndTime < minEndBooking) {
//                minEndBooking = b.expectedEndTime;
//              }
//           }

//       }
//     } catch (err) {
//       console.error("Create booking error:", err);
//       return res.status(500).json({ error: "Booking creation failed", err });
//     }
//   }
// );

router.post(
  "/create",
  AuthenticateUser(userRegistrationSchema),
  async (req, res) => {
    try {
      const {
        stationId,
        port_Id,
        expectedArrivalTime,
        estimatedChargingDuration,
        paymentMode,
        totalPrice,
        vehicleType,
        userName,
        userEmail,
        userMobile,
        units,
        pricePerUnit,
      } = req.body;

      const user_id = req.user._id;

      const station = await stationDetailsSchema.findById(stationId);
      if (!station) {
        return res
          .status(404)
          .json({ success: false, message: "Station not found" });
      }

      // Basic validation & normalization
      if (
        !stationId ||
        !port_Id ||
        !expectedArrivalTime ||
        !estimatedChargingDuration
      ) {
        return res.status(400).json({
          success: false,
          message:
            "stationId, port_Id, expectedArrivalTime and estimatedChargingDuration are required",
        });
      }

      const arrival = new Date(expectedArrivalTime);
      if (isNaN(arrival.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid expectedArrivalTime" });
      }

      const durationHours = Number(estimatedChargingDuration);
      if (isNaN(durationHours) || durationHours <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid estimatedChargingDuration",
        });
      }
      const durationMs = durationHours * 60 * 60 * 1000;

      // Fetch port
      const portData = await stationPortSchema.findById(port_Id);
      if (!portData)
        return res
          .status(404)
          .json({ success: false, message: "Port not found" });

      const totalPorts = Number(portData.totalPorts) || 1;
      if (totalPorts <= 0)
        return res
          .status(500)
          .json({ success: false, message: "Port misconfigured (totalPorts)" });

      // Fetch all bookings for this station+port ordered by expectedArrivalTime (arrival FIFO)
      const bookings = await bookingSchema
        .find({
          stationId,
          port_Id,
          bookingStatus: { $in: ["PENDING", "INPROGRESS", "WAITING"] },
        })
        .sort({ expectedArrivalTime: 1, createdAt: 1 })
        .lean();

      // Prepare portFree array: next free time of each socket
      // initialize to epoch (meaning free immediately)
      let portFree = Array.from({ length: totalPorts }, () => new Date(0));

      // Helper: return booking duration in ms (safely)
      const bookingDurationMs = (b) => {
        const d = Number(b.estimatedChargingDuration);
        return isNaN(d) || d <= 0 ? null : d * 60 * 60 * 1000;
      };

      // Simulate assignment for all existing bookings in arrival order
      // We'll compute actualStart/actualEnd per booking and update DB if needed
      for (let b of bookings) {
        // Validate expectedArrivalTime
        if (!b.expectedArrivalTime) {
          // skip corrupted booking
          console.warn("Skipping booking (no expectedArrivalTime):", b._id);
          continue;
        }

        const bArrival = new Date(b.expectedArrivalTime);
        if (isNaN(bArrival.getTime())) {
          console.warn(
            "Skipping booking (invalid expectedArrivalTime):",
            b._id
          );
          continue;
        }

        const bDurMs = bookingDurationMs(b);
        if (!bDurMs) {
          console.warn("Skipping booking (invalid duration):", b._id);
          continue;
        }

        // find index of port that becomes free earliest
        const freeTimes = portFree.map((d) => d.getTime());
        const minFree = Math.min(...freeTimes);
        const idx = freeTimes.findIndex((t) => t === minFree);

        // actual start = max(arrival, portFree[idx])
        const actualStart = new Date(
          Math.max(bArrival.getTime(), portFree[idx].getTime())
        );
        const actualEnd = new Date(actualStart.getTime() + bDurMs);

        // update port free time
        portFree[idx] = actualEnd;

        // Update DB booking's startTime/endTime if different (non-blocking)
        // We use a try/catch to avoid breaking simulation on save errors
        try {
          const toUpdate = {};
          if (
            !b.startTime ||
            new Date(b.startTime).getTime() !== actualStart.getTime()
          ) {
            toUpdate.startTime = actualStart;
          }
          if (
            !b.endTime ||
            new Date(b.endTime).getTime() !== actualEnd.getTime()
          ) {
            toUpdate.endTime = actualEnd;
          }
          if (Object.keys(toUpdate).length > 0) {
            await bookingSchema
              .findByIdAndUpdate(b._id, toUpdate, { new: true })
              .catch((e) => {
                console.warn(
                  "Failed to update existing booking times:",
                  b._id,
                  e.message
                );
              });
          }
        } catch (e) {
          console.warn("Error updating booking times (ignored):", e.message);
        }
      }

      // After simulation, choose the earliest free port for the new user
      const freeTimesAfterSim = portFree.map((d) => d.getTime());
      const earliestFreeTimeMs = Math.min(...freeTimesAfterSim);
      const earliestPortIndex = freeTimesAfterSim.findIndex(
        (t) => t === earliestFreeTimeMs
      );
      const earliestFreeTime = new Date(earliestFreeTimeMs);

      // Decide if new user can start at arrival or must wait
      let finalStart, finalEnd, isWaiting;
      if (arrival.getTime() >= earliestFreeTime.getTime()) {
        // can start at arrival
        finalStart = arrival;
        isWaiting = false;
      } else {
        // must wait until earliestFreeTime
        finalStart = earliestFreeTime;
        isWaiting = true;
      }
      finalEnd = new Date(finalStart.getTime() + durationMs);

      // If confirmed (not waiting) and ONLINE, create razorpay order first
      // If confirmed → decrement availablePorts & increment inUsePorts immediately to reserve socket
      if (!isWaiting) {
        if (paymentMode === "ONLINE") {
          // Create razor order
          const razorOrder = await razorpay.orders.create({
            amount: Number(totalPrice || 0) * 100,
            currency: "INR",
            receipt: "rcpt_" + Date.now(),
          });

          // Create booking with PENDING status (paid after verification)
          const booking = await bookingSchema.create({
            user_id,
            userName,
            userEmail,
            userMobile,
            stationId,
            port_Id,
            units,
            pricePerUnit,
            totalPrice,
            paymentMode: "ONLINE",
            paymentStatus: "PENDING",
            bookingStatus: "PENDING",
            isWaiting: false,
            waitingQueuePosition: 0,
            expectedArrivalTime: arrival,
            estimatedChargingDuration: durationHours,
            startTime: finalStart,
            endTime: finalEnd,
            vehicleType,
          });

          // Reserve one socket immediately

          return res.status(200).json({
            success: true,
            slotAvailable: true,
            isWaiting: false,
            message: "Order created. Complete payment.",
            razorpayKey: process.env.RAZORPAY_KEY_ID,
            order: razorOrder,
            bookingId: booking._id,
            startTime: finalStart,
            endTime: finalEnd,
          });
        }

        // OFFLINE confirmed booking
        const booking = await bookingSchema.create({
          user_id,
          userName,
          userEmail,
          userMobile,
          stationId,
          port_Id,
          units,
          pricePerUnit,
          totalPrice,
          paymentMode: "OFFLINE",
          paymentStatus: "PENDING",
          bookingStatus: "PENDING",
          isWaiting: false,
          waitingQueuePosition: 0,
          expectedArrivalTime: arrival,
          estimatedChargingDuration: durationHours,
          startTime: finalStart,
          endTime: finalEnd,
          vehicleType,
        });

        sendStationMail(station, booking, portData.portType, vehicleType);

        // Reserve one socket immediately

        return res.status(201).json({
          success: true,
          slotAvailable: true,
          isWaiting: false,
          message: "Booking created successfully (offline).",
          data: booking,
          startTime: finalStart,
          endTime: finalEnd,
        });
      }

      // If waiting:
      // compute queue position relative to other waiting bookings for same time window
      const waitingCount = await bookingSchema.countDocuments({
        stationId,
        port_Id,
        isWaiting: true,
      });

      const booking = await bookingSchema.create({
        user_id,
        userName,
        userEmail,
        userMobile,
        stationId,
        port_Id,
        units,
        pricePerUnit,
        totalPrice,
        paymentMode: "OFFLINE", // waiting -> offline forced in your earlier flow
        paymentStatus: "PENDING",
        bookingStatus: "WAITING",
        isWaiting: true,
        waitingQueuePosition: waitingCount + 1,
        expectedArrivalTime: arrival,
        estimatedChargingDuration: durationHours,
        startTime: finalStart,
        endTime: finalEnd,
        vehicleType,
      });

      sendStationMail(station, booking, portData.portType, vehicleType);

      return res.status(200).json({
        success: true,
        slotAvailable: false,
        isWaiting: true,
        message:
          "All ports busy at requested time. You were added to waiting queue.",
        queuePosition: waitingCount + 1,
        startTime: finalStart,
        endTime: finalEnd,
        data: booking,
      });
    } catch (err) {
      console.error("Create booking error:", err);
      return res.status(500).json({
        success: false,
        error: "Booking creation failed",
        details: err.message || err,
      });
    }
  }
);

// ---------------------------- VERIFY PAYMENT ----------------------------
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      stationId,
      portType,
      userEmail,
      vehicleType,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const booking = await bookingSchema.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "PAID",
        bookingStatus: "PENDING",
        startTime: new Date(),
        vehicleType,
      },
      { new: true }
    );

    const station = await stationDetailsSchema.findById(stationId);

    sendStationMail(station, booking, portType, vehicleType);

    if (userEmail) {
      await sendUserInvoiceMail(userEmail, booking, portType, vehicleType);
    }

    res.json({ message: "Payment Verified!", data: booking });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ error: "Error verifying payment", err });
  }
});

// GET BOOKINGS BY STATION ID
router.get("/station/bookings/:stationId", async (req, res) => {
  try {
    const { stationId } = req.params;

    const bookings = await bookingSchema
      .find({ stationId })
      .populate("stationId")
      .populate("port_Id")
      .populate("user_id");

    // 1️⃣ Define custom priority
    const statusPriority = {
      INPROGRESS: 1,
      PENDING: 2,
      WAITING: 3,
      COMPLETED: 4,
      CANCELLED: 5,
    };

    // 2️⃣ Apply sorting
    const sorted = bookings.sort((a, b) => {
      const priorityA = statusPriority[a.bookingStatus] || 999;
      const priorityB = statusPriority[b.bookingStatus] || 999;

      // If same status → sort by startTime (latest first)
      if (priorityA === priorityB) {
        return new Date(b.startTime || 0) - new Date(a.startTime || 0);
      }

      return priorityA - priorityB;
    });

    res.json({ data: sorted });
  } catch (err) {
    console.error("Error fetching station bookings", err);
    res.status(500).json({ message: "Error fetching station bookings", err });
  }
});

// GET BOOKINGS BY USER ID
router.get(
  "/user-bookings",
  AuthenticateUser(userRegistrationSchema), // Authenticate user first
  async (req, res) => {
    try {
      const userId = req.user._id;

      const bookings = await bookingSchema
        .find({ user_id: userId })
        .populate("stationId")
        .populate("port_Id");

      // Map bookings to include waiting info if applicable
      const bookingsWithWaiting = await Promise.all(
        bookings.map(async (booking) => {
          if (booking.isWaiting) {
            const totalWaiting = await bookingSchema.countDocuments({
              port_Id: booking.port_Id,
              isWaiting: true,
            });

            const queueAhead = await bookingSchema.countDocuments({
              port_Id: booking.port_Id,
              isWaiting: true,
              waitingQueuePosition: { $lt: booking.waitingQueuePosition },
            });

            return {
              ...booking.toObject(),
              totalWaiting,
              queueAhead,
              position: booking.waitingQueuePosition,
            };
          }
          return booking;
        })
      );

      res.json({ data: bookingsWithWaiting });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching bookings for user", err });
    }
  }
);

router.patch("/update/:id", async (req, res) => {
  try {
    const allowedFields = [
      "userName",
      "userEmail",
      "userMobile",
      "port_Id",
      "units",
      "pricePerUnit",
      "totalPrice",
      "paymentMode",
      "paymentStatus",
      "bookingStatus",
      "startTime",
      "endTime",
    ];

    const updateData = {};

    // Pick only allowed fields
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // ❌ Prevent stationId & user_id updates at any cost
    // Even if frontend sends them, ignore completely
    delete updateData.stationId;
    delete updateData.user_id;

    const booking = await bookingSchema.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ message: "Booking updated", data: booking });
  } catch (err) {
    res.status(500).json({ message: "Error updating booking", err });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await bookingSchema.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting booking", err });
  }
});

// CANCEL BOOKING (Only allowed for OFFLINE payments)
router.patch("/cancel/:id", async (req, res) => {
  try {
    const booking = await bookingSchema.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ❌ Cannot cancel ONLINE booking
    if (booking.paymentMode === "ONLINE") {
      return res.status(400).json({
        message: "Online bookings cannot be cancelled. Contact support.",
      });
    }

    // ✔ Allowed: OFFLINE booking → Cancel it
    booking.bookingStatus = "CANCELLED";
    booking.paymentStatus = "NOT_APPLICABLE"; // optional
    booking.endTime = new Date();

    await booking.save();

    res.json({ message: "Booking cancelled successfully", data: booking });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling booking", err });
  }
});

router.post("/cancel-payment", async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await bookingSchema.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Restore port ONLY if booking was using a port
    if (!booking.isWaiting) {
      await stationPortSchema.findByIdAndUpdate(booking.port_Id, {
        $inc: {
          availablePorts: +1,
          inUsePorts: -1,
        },
      });
    }

    // Remove booking record
    await bookingSchema.findByIdAndDelete(bookingId);

    res.json({ message: "Payment cancelled. Port restored." });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling payment", err });
  }
});

router.get("/waiting-list/:stationId", async (req, res) => {
  try {
    const list = await bookingSchema
      .find({
        stationId: req.params.stationId,
        isWaiting: true,
      })
      .sort({ waitingQueuePosition: 1 });

    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ message: "Error fetching waiting list", err });
  }
});

// CONFIRM WAITING BOOKING → Move to PENDING
router.put("/confirm-waiting/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Get booking details
    const booking = await bookingSchema
      .findById(bookingId)
      .populate("user_id") // for user email
      .populate("stationId") // for station details
      .populate("port_Id"); // for port details

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.isWaiting) {
      return res.status(400).json({ message: "This booking is not in queue" });
    }

    // Update booking status
    const updatedBooking = await bookingSchema.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: "PENDING",
        isWaiting: false,
        waitingQueuePosition: null,
        queueConfirmedAt: new Date(),
      },
      { new: true }
    );

    // Update station port usage
    await stationPortSchema.findByIdAndUpdate(booking.port_Id, {
      $inc: { availablePorts: -1, inUsePorts: 1 },
    });

    const user = await userRegistrationSchema.findById(booking.user_id);
    const port = await stationPortSchema.findById(booking.port_Id);

    // -----------------------------------------
    // 📩 SEND CONFIRMATION MAIL TO USER
    // -----------------------------------------

    try {
      await sendUserConfirmationMail(
        updatedBooking, // full user object
        port.portType, // updated booking
        booking.stationId // station details
      );
    } catch (mailErr) {
      console.log("Email Sending Failed:", mailErr);
    }

    res.json({
      success: true,
      message: "Booking confirmed successfully and email sent",
      data: updatedBooking,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error confirming booking", err });
  }
});

router.put("/cancel-booking/:bookingId", async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    // Fetch booking
    const booking = await bookingSchema.findById(bookingId);

    if (!booking || !booking.isWaiting) {
      return res.status(400).json({ error: "Booking not in waiting list" });
    }

    // Save old queue position before updating
    const oldPos = booking.waitingQueuePosition;

    // Mark booking as cancelled
    booking.bookingStatus = "CANCELLED";
    booking.paymentStatus = "NA";
    booking.paymentMode = "NA";
    booking.isWaiting = false;
    booking.waitingQueuePosition = null;

    await booking.save();

    // ⭐ Shift only if booking was in waiting queue
    if (oldPos !== null && oldPos !== undefined) {
      await bookingSchema.updateMany(
        {
          port_Id: booking.port_Id,
          isWaiting: true,
          waitingQueuePosition: { $gt: oldPos },
        },
        { $inc: { waitingQueuePosition: -1 } }
      );
    }

    res.status(200).json({ message: "Booking cancelled successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cancelling waiting booking", err });
  }
});

router.put("/update-status/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  const { bookingStatus } = req.body;

  const validStatuses = ["INPROGRESS", "COMPLETED"];
  if (!validStatuses.includes(bookingStatus)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid booking status" });
  }

  try {
    // 1️⃣ Fetch booking
    const booking = await bookingSchema.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    // 2️⃣ Add timestamps based on status change
    if (bookingStatus === "INPROGRESS") {
      const port = await stationPortSchema.findById(booking.port_Id);
      if (port.inUsePorts === port.totalPorts) {
        return res.status(400).json({ error: "No more ports available" });
      }
      booking.startTime = new Date();
    }

    if (bookingStatus === "COMPLETED") {
      if (booking.bookingStatus !== "INPROGRESS") {
        return res.status(400).json({
          error: "Booking is not in progress, First mark it as INPROGRESS",
        });
      }
      booking.endTime = new Date();
    }

    // 3️⃣ Update booking status
    booking.bookingStatus = bookingStatus;

    // 4️⃣ If completed + offline payment → mark as PAID
    if (
      bookingStatus === "COMPLETED" &&
      booking.paymentMode === "OFFLINE" &&
      booking.paymentStatus !== "PAID"
    ) {
      booking.paymentStatus = "PAID";
    }

    // 5️⃣ Save booking first
    const updatedBooking = await booking.save();

    // 6️⃣ PORT LOGIC
    const port = await stationPortSchema.findById(booking.port_Id);

    if (port) {
      // When booking becomes IN_PROGRESS → port becomes in use
      if (bookingStatus === "INPROGRESS") {
        port.inUsePorts = Math.min(port.totalPorts, port.inUsePorts + 1);
        port.availablePorts = Math.max(0, port.availablePorts - 1);
      }

      // When booking becomes COMPLETED → free port
      if (bookingStatus === "COMPLETED") {
        port.inUsePorts = Math.max(0, port.inUsePorts - 1);
        port.availablePorts = Math.min(
          port.totalPorts,
          port.availablePorts + 1
        );
      }

      await port.save();
    }

    res.json({ success: true, data: updatedBooking });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET waiting count for a specific station + port
// router.get("/waiting-count/:stationId/:portId", async (req, res) => {
//   try {
//     const { stationId, portId } = req.params;

//     const waitingCount = await bookingSchema.countDocuments({
//       stationId: stationId,
//       port_Id: portId,
//       isWaiting: true,
//     });

//     const ports = await stationPortSchema.find({
//       _id: portId,
//     });
//     res.status(200).json({
//       success: true,
//       waitingCount,
//       availablePorts: ports[0].availablePorts,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch waiting count",
//       error,
//     });
//   }
// });

// router.get("/slot-check/:stationId/:portId", async (req, res) => {
//   try {
//     const { stationId, portId } = req.params;
//     const { arrivalTime } = req.query;

//     if (!arrivalTime) {
//       return res.status(400).json({
//         success: false,
//         error: "arrivalTime (ISO format) is required",
//       });
//     }

//     const userArrival = new Date(arrivalTime);

//     // Fetch port info (how many ports available)
//     const portData = await stationPortSchema.findById(portId);
//     if (!portData) {
//       return res.status(404).json({
//         success: false,
//         error: "Port not found",
//       });
//     }

//     const totalPorts = portData.totalPorts; // Make sure schema has this
//     const availablePorts = portData.availablePorts; // Optional but useful

//     // Get all existing bookings (not waiting)
//     const bookings = await bookingSchema.find({
//       stationId,
//       port_Id: portId,
//       isWaiting: false,
//     });

//     let overlappingBookings = [];
//     let nextAvailableTime = null;

//     for (let booking of bookings) {
//       const existingStart = new Date(booking.expectedArrivalTime);
//       const existingEnd = new Date(
//         existingStart.getTime() +
//           booking.estimatedChargingDuration * 60 * 60 * 1000
//       );

//       // User's calculated end time (use SAME vehicle's duration later)
//       const userEnd = new Date(
//         userArrival.getTime() +
//           booking.estimatedChargingDuration * 60 * 60 * 1000
//       );

//       const overlap = userArrival < existingEnd && userEnd > existingStart;

//       if (overlap) {
//         overlappingBookings.push({
//           booking,
//           existingStart,
//           existingEnd,
//         });
//       }
//     }

//     // Determine slot availability
//     const isSlotAvailable = overlappingBookings.length < totalPorts; // <-- FIXED

//     if (!isSlotAvailable) {
//       // Find the latest end time among overlapping bookings
//       nextAvailableTime = new Date(
//         Math.max(...overlappingBookings.map((b) => b.existingEnd.getTime()))
//       );
//     }

//     // Waiting count
//     const waitingCount = await bookingSchema.countDocuments({
//       stationId,
//       port_Id: portId,
//       isWaiting: true,
//     });

//     return res.status(200).json({
//       success: true,
//       isSlotAvailable,
//       overlappingCount: overlappingBookings.length,
//       totalPorts,
//       nextAvailableTime,
//       waitingCount,
//       conflictBookings: overlappingBookings,
//       message: isSlotAvailable
//         ? "Slot is available"
//         : "All ports are busy at this time. Choose another time or join waiting queue.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error,
//     });
//   }
// });

router.post("/calculate", async (req, res) => {
  try {
    const { stationId, portId, vehicleType } = req.body;

    // 1. Calculate demand → active bookings for station
    let demand = await bookingSchema.countDocuments({
      stationId,
      bookingStatus: { $in: ["PENDING", "INPROGRESS", "WAITING"] },
    });

    demand = 0;

    // 2. Get station port load
    const port = await stationPortSchema.findById(portId);
    const station_load = port.inUsePorts / port.totalPorts;
    0;
    // 3. Auto-generate current time fields
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDate();
    const weekday = now.getDay(); // Sunday = 0, Monday = 1 ...

    // 4. Prepare payload for Flask API
    const payload = {
      demand,
      station_load,
      vehicle_type: vehicleType,
      hour,
      day,
      weekday,
    };

    // 5. Call Flask API for dynamic price
    const predictedPrice = await getDynamicPrice(payload);

    return res.json({
      success: true,
      pricePerUnit: predictedPrice,
      demand,
      station_load,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/slot-check", async (req, res) => {
  try {
    const { stationId, portId, arrivalTime, chargingMinutes } = req.body;

    const userArrival = new Date(arrivalTime);

    // 1. Fetch all bookings for this station + port sorted by actualStartTime
    const port = await stationPortSchema.findById(portId);
    let bookings = await bookingSchema
      .find({
        stationId,
        port_Id: portId,
        bookingStatus: { $in: ["PENDING", "WAITING"] },
      })
      .sort({ startTime: 1 });

    // If no bookings exist → slot is directly available
    if (bookings.length === 0 || bookings.length < port.totalPorts) {
      const start = userArrival;
      const end = new Date(start.getTime() + chargingMinutes * 60000);

      return res.status(200).json({
        status: "CONFIRMED",
        actualStartTime: start,
        actualEndTime: end,
        nextAvailableTime: start,
        queuePosition: 0,
        waitingCount: 0,
        message: "Port is free — booking can be confirmed.",
      });
    }

    // 2. Build a timeline of actual occupied blocks
    let timeline = [];

    for (let b of bookings) {
      timeline.push({
        start: new Date(b.startTime),
        end: new Date(b.endTime),
      });
    }

    // 3. Determine earliest possible available time (next free slot)
    let nextFree = new Date(timeline[0].start);

    // Move through timeline to find the last occupied end time
    for (let block of timeline) {
      if (nextFree < block.end) {
        nextFree = Math.min(...timeline.map((b) => new Date(b.end).getTime()));
      }
    }

    // 4. Compare user request with next availability
    if (userArrival >= nextFree) {
      // User can be directly confirmed
      const start = userArrival;
      const end = new Date(start.getTime() + chargingMinutes * 60000);

      return res.status(200).json({
        status: "CONFIRMED",
        actualStartTime: start,
        actualEndTime: end,
        nextAvailableTime: nextFree,
        queuePosition: 0,
        message: "Your arrival time is valid — slot confirmed.",
      });
    }

    // 5. Otherwise → user must wait
    // Their green-light start is nextFree
    const waitingStart = new Date(nextFree);
    const waitingEnd = new Date(
      waitingStart.getTime() + chargingMinutes * 60000
    );

    // How many people are waiting ahead of user?
    const waitingCount = await bookingSchema.countDocuments({
      stationId,
      port_Id: portId,
      isWaiting: true,
      expectedArrivalTime: { $lte: arrivalTime },
    });

    return res.status(200).json({
      status: "WAITING",
      actualStartTime: waitingStart,
      actualEndTime: waitingEnd,
      nextAvailableTime: nextFree,
      queuePosition: waitingCount + 1,
      waitingCount: waitingCount || 0,
      message: `Port busy. You will be added to waiting queue at position ${
        waitingCount + 1
      }.`,
    });
  } catch (error) {
    console.error("Slot check error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Failed to check slot",
      error,
    });
  }
});

module.exports = router;
