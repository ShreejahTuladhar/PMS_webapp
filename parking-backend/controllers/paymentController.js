const Booking = require("../models/Booking");
const ParkingLocation = require("../models/ParkingLocation");
const paypal = require("paypal-rest-sdk");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// @desc    Calculate booking fee
// @route   POST /api/payments/calculate-fee
// @access  Private
const calculateFee = async (req, res) => {
  try {
    const { locationId, startTime, endTime, spaceType } = req.body;

    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));

    let baseRate = location.hourlyRate;

    // Apply space type multiplier
    const spaceTypeMultipliers = {
      regular: 1.0,
      handicapped: 1.0,
      "ev-charging": 1.2,
      reserved: 1.5,
    };

    const multiplier = spaceTypeMultipliers[spaceType] || 1.0;
    const subtotal = durationHours * baseRate * multiplier;

    // Calculate taxes and fees
    const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
    const tax = Math.round((subtotal + serviceFee) * 0.13); // 13% tax
    const total = subtotal + serviceFee + tax;

    res.json({
      success: true,
      data: {
        duration: {
          hours: durationHours,
          startTime: start,
          endTime: end,
        },
        pricing: {
          baseRate,
          spaceTypeMultiplier: multiplier,
          subtotal,
          serviceFee,
          tax,
          total,
        },
        breakdown: {
          baseAmount: `${durationHours} hours × Rs. ${baseRate} × ${multiplier} = Rs. ${subtotal}`,
          serviceFee: `Service fee (5%) = Rs. ${serviceFee}`,
          tax: `Tax (13%) = Rs. ${tax}`,
          total: `Total = Rs. ${total}`,
        },
      },
    });
  } catch (error) {
    console.error("Calculate fee error:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating fee",
      error: error.message,
    });
  }
};

// @desc    Create PayPal payment
// @route   POST /api/payments/paypal/create
// @access  Private
const createPayPalPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("locationId", "name address")
      .populate("userId", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (booking.paymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed for this booking",
      });
    }

    const payment = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_URL}/payment/success?bookingId=${bookingId}`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel?bookingId=${bookingId}`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: `Parking at ${booking.locationId.name}`,
                sku: `PARKING_${booking._id}`,
                price: booking.totalAmount.toFixed(2),
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: booking.totalAmount.toFixed(2),
          },
          description: `Parking reservation at ${booking.locationId.name} from ${booking.startTime} to ${booking.endTime}`,
        },
      ],
    };

    paypal.payment.create(payment, (error, payment) => {
      if (error) {
        console.error("PayPal payment creation error:", error);
        return res.status(500).json({
          success: false,
          message: "Error creating PayPal payment",
          error: error.message,
        });
      }

      // Save PayPal payment ID to booking
      booking.paymentTransactionId = payment.id;
      booking.save();

      const approvalUrl = payment.links.find(
        (link) => link.rel === "approval_url"
      );

      res.json({
        success: true,
        message: "PayPal payment created successfully",
        data: {
          paymentId: payment.id,
          approvalUrl: approvalUrl.href,
          amount: booking.totalAmount,
        },
      });
    });
  } catch (error) {
    console.error("Create PayPal payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating PayPal payment",
      error: error.message,
    });
  }
};

// @desc    Execute PayPal payment
// @route   POST /api/payments/paypal/execute
// @access  Private
const executePayPalPayment = async (req, res) => {
  try {
    const { paymentId, PayerID, bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("locationId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentTransactionId !== paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID mismatch",
      });
    }

    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: booking.totalAmount.toFixed(2),
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async (error, payment) => {
        if (error) {
          console.error("PayPal payment execution error:", error);

          // Update booking payment status
          booking.paymentStatus = "failed";
          await booking.save();

          return res.status(500).json({
            success: false,
            message: "Payment execution failed",
            error: error.message,
          });
        }

        if (payment.state === "approved") {
          // Update booking status
          booking.paymentStatus = "completed";
          booking.status = "confirmed";
          booking.paymentTransactionId = payment.id;
          await booking.save();

          // Reserve the parking space
          const location = booking.locationId;
          await location.updateSpaceStatus(booking.spaceId, "reserved");

          // Emit real-time updates
          const {
            emitSpaceUpdate,
            emitAvailabilityUpdate,
          } = require("../utils/socketManager");
          emitSpaceUpdate(location._id, {
            spaceId: booking.spaceId,
            newStatus: "reserved",
            bookingId: booking._id,
          });

          emitAvailabilityUpdate(location._id, {
            availableSpaces: location.availableSpaces,
            totalSpaces: location.totalSpaces,
          });

          res.json({
            success: true,
            message: "Payment completed successfully",
            data: {
              bookingId: booking._id,
              paymentId: payment.id,
              status: booking.status,
              paymentStatus: booking.paymentStatus,
            },
          });
        } else {
          booking.paymentStatus = "failed";
          await booking.save();

          res.status(400).json({
            success: false,
            message: "Payment not approved",
            paymentState: payment.state,
          });
        }
      }
    );
  } catch (error) {
    console.error("Execute PayPal payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error executing PayPal payment",
      error: error.message,
    });
  }
};

// @desc    Create eSewa payment
// @route   POST /api/payments/esewa/create
// @access  Private
const createESewaPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("locationId", "name address")
      .populate("userId", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (booking.paymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed for this booking",
      });
    }

    // Generate unique transaction ID
    const transactionId = `PARKING_${booking._id}_${Date.now()}`;

    // eSewa payment form data
    const esewaData = {
      amt: booking.totalAmount,
      pdc: 0,
      psc: 0,
      txAmt: 0,
      tAmt: booking.totalAmount,
      pid: transactionId,
      scd: process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
      su: `${process.env.CLIENT_URL}/payment/esewa/success?bookingId=${bookingId}`,
      fu: `${process.env.CLIENT_URL}/payment/esewa/failure?bookingId=${bookingId}`,
    };

    // Save transaction ID to booking
    booking.paymentTransactionId = transactionId;
    await booking.save();

    res.json({
      success: true,
      message: "eSewa payment form data generated",
      data: {
        formData: esewaData,
        actionUrl:
          process.env.ESEWA_URL || "https://uat.esewa.com.np/epay/main",
        transactionId,
      },
    });
  } catch (error) {
    console.error("Create eSewa payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating eSewa payment",
      error: error.message,
    });
  }
};

// @desc    Verify eSewa payment
// @route   POST /api/payments/esewa/verify
// @access  Private
const verifyESewaPayment = async (req, res) => {
  try {
    const { bookingId, oid, amt, refId } = req.body;

    const booking = await Booking.findById(bookingId).populate("locationId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify transaction with eSewa (in production, you would call eSewa verification API)
    const isVerified = true; // For demo purposes

    if (isVerified && parseFloat(amt) === booking.totalAmount) {
      // Update booking status
      booking.paymentStatus = "completed";
      booking.status = "confirmed";
      booking.paymentTransactionId = refId;
      await booking.save();

      // Reserve the parking space
      const location = booking.locationId;
      await location.updateSpaceStatus(booking.spaceId, "reserved");

      // Emit real-time updates
      const {
        emitSpaceUpdate,
        emitAvailabilityUpdate,
      } = require("../utils/socketManager");
      emitSpaceUpdate(location._id, {
        spaceId: booking.spaceId,
        newStatus: "reserved",
        bookingId: booking._id,
      });

      emitAvailabilityUpdate(location._id, {
        availableSpaces: location.availableSpaces,
        totalSpaces: location.totalSpaces,
      });

      res.json({
        success: true,
        message: "eSewa payment verified successfully",
        data: {
          bookingId: booking._id,
          transactionId: refId,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
        },
      });
    } else {
      booking.paymentStatus = "failed";
      await booking.save();

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Verify eSewa payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying eSewa payment",
      error: error.message,
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, method } = req.query;
    const skip = (page - 1) * limit;

    let filter = { userId: req.user.id };

    if (status) filter.paymentStatus = status;
    if (method) filter.paymentMethod = method;

    const payments = await Booking.find(filter)
      .select(
        "totalAmount paymentStatus paymentMethod paymentTransactionId createdAt locationId startTime endTime"
      )
      .populate("locationId", "name address")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    // Calculate summary
    const summary = await Booking.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalPaid: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "completed"] },
                "$totalAmount",
                0,
              ],
            },
          },
          totalPending: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "pending"] },
                "$totalAmount",
                0,
              ],
            },
          },
          completedPayments: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      success: true,
      count: payments.length,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
      summary: summary[0] || {
        totalPaid: 0,
        totalPending: 0,
        completedPayments: 0,
      },
      data: payments,
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

module.exports = {
  calculateFee,
  createPayPalPayment,
  executePayPalPayment,
  createESewaPayment,
  verifyESewaPayment,
  getPaymentHistory,
};
