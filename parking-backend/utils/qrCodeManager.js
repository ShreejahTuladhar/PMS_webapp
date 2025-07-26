const QRCode = require("qrcode");
const crypto = require("crypto");

// Generate QR code for booking
const generateBookingQR = async (bookingData) => {
  try {
    const qrData = {
      type: "parking_booking",
      bookingId: bookingData.bookingId,
      locationId: bookingData.locationId,
      spaceId: bookingData.spaceId,
      userId: bookingData.userId,
      validFrom: bookingData.startTime,
      validUntil: bookingData.endTime,
      timestamp: Date.now(),
      hash: generateSecurityHash(bookingData),
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    });

    return {
      qrCode: qrCodeDataURL,
      qrData: qrData,
    };
  } catch (error) {
    console.error("QR code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
};

// Verify QR code authenticity
const verifyBookingQR = (qrData, booking) => {
  try {
    const parsedData = typeof qrData === "string" ? JSON.parse(qrData) : qrData;

    // Verify basic structure
    if (!parsedData.type || parsedData.type !== "parking_booking") {
      return { valid: false, reason: "Invalid QR code type" };
    }

    // Verify booking ID matches
    if (parsedData.bookingId !== booking._id.toString()) {
      return { valid: false, reason: "Booking ID mismatch" };
    }

    // Verify location and space
    if (
      parsedData.locationId !== booking.locationId.toString() ||
      parsedData.spaceId !== booking.spaceId
    ) {
      return { valid: false, reason: "Location or space mismatch" };
    }

    // Verify user
    if (parsedData.userId !== booking.userId.toString()) {
      return { valid: false, reason: "User mismatch" };
    }

    // Verify time validity
    const now = new Date();
    const validFrom = new Date(parsedData.validFrom);
    const validUntil = new Date(parsedData.validUntil);

    if (now < validFrom) {
      return { valid: false, reason: "QR code not yet valid" };
    }

    if (now > validUntil) {
      return { valid: false, reason: "QR code has expired" };
    }

    // Verify security hash
    const expectedHash = generateSecurityHash({
      bookingId: parsedData.bookingId,
      locationId: parsedData.locationId,
      spaceId: parsedData.spaceId,
      userId: parsedData.userId,
      startTime: parsedData.validFrom,
      endTime: parsedData.validUntil,
    });

    if (parsedData.hash !== expectedHash) {
      return { valid: false, reason: "Security hash verification failed" };
    }

    return { valid: true, data: parsedData };
  } catch (error) {
    console.error("QR verification error:", error);
    return { valid: false, reason: "QR code verification failed" };
  }
};

// Generate security hash for QR code
const generateSecurityHash = (data) => {
  const secret = process.env.QR_SECRET || "default_qr_secret";
  const hashString = `${data.bookingId}-${data.locationId}-${data.spaceId}-${data.userId}-${data.startTime}-${data.endTime}`;
  return crypto.createHmac("sha256", secret).update(hashString).digest("hex");
};

module.exports = {
  generateBookingQR,
  verifyBookingQR,
  generateSecurityHash,
};
