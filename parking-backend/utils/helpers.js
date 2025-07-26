const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Date and time utilities
const dateHelpers = {
  // Format date to readable string
  formatDate: (date, format = "YYYY-MM-DD") => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    const formats = {
      "YYYY-MM-DD": `${year}-${month}-${day}`,
      "DD/MM/YYYY": `${day}/${month}/${year}`,
      "MMM DD, YYYY": `${d.toLocaleDateString("en-US", { month: "short" })} ${day}, ${year}`,
      "YYYY-MM-DD HH:mm": `${year}-${month}-${day} ${hours}:${minutes}`,
      "DD/MM/YYYY HH:mm": `${day}/${month}/${year} ${hours}:${minutes}`,
    };

    return formats[format] || d.toISOString();
  },

  // Check if date is today
  isToday: (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
  },

  // Get time difference in human readable format
  getTimeDifference: (startDate, endDate = new Date()) => {
    const diff = Math.abs(new Date(endDate) - new Date(startDate));
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  },

  // Add time to date
  addTime: (date, amount, unit = "hours") => {
    const result = new Date(date);
    switch (unit) {
      case "minutes":
        result.setMinutes(result.getMinutes() + amount);
        break;
      case "hours":
        result.setHours(result.getHours() + amount);
        break;
      case "days":
        result.setDate(result.getDate() + amount);
        break;
      default:
        result.setHours(result.getHours() + amount);
    }
    return result;
  },

  // Check if time is within business hours
  isWithinBusinessHours: (time, startHour = 6, endHour = 22) => {
    const checkTime = new Date(time);
    const hour = checkTime.getHours();
    return hour >= startHour && hour < endHour;
  },
};

// String utilities
const stringHelpers = {
  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Convert to title case
  toTitleCase: (str) => {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Generate random string
  generateRandomString: (length = 10, includeNumbers = true) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const chars = includeNumbers ? letters + numbers : letters;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Slugify string
  slugify: (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  // Truncate string
  truncate: (str, length = 100, suffix = "...") => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  // Clean phone number
  cleanPhoneNumber: (phone) => {
    if (!phone) return "";
    return phone.replace(/[^\d+]/g, "");
  },

  // Format phone number for display
  formatPhoneNumber: (phone) => {
    const cleaned = stringHelpers.cleanPhoneNumber(phone);
    if (cleaned.startsWith("+977")) {
      // Nepal format: +977 98-41234567
      return cleaned.replace(/(\+977)(\d{2})(\d{8})/, "$1 $2-$3");
    }
    return phone;
  },
};

// Number utilities
const numberHelpers = {
  // Format currency (Nepali Rupees)
  formatCurrency: (amount, currency = "NPR") => {
    const formatted = new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    // Replace NPR with Rs. for Nepali Rupees
    return currency === "NPR" ? formatted.replace("NPR", "Rs.") : formatted;
  },

  // Format percentage
  formatPercentage: (value, decimals = 1) => {
    return `${Number(value).toFixed(decimals)}%`;
  },

  // Round to nearest value
  roundTo: (number, precision = 2) => {
    return (
      Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision)
    );
  },

  // Generate random number within range
  randomNumber: (min = 0, max = 100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Convert bytes to human readable format
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },
};

// Validation utilities
const validationHelpers = {
  // Validate email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate Nepali phone number
  isValidNepaliPhone: (phone) => {
    const phoneRegex = /^(\+977[-\s]?)?[9][6-9]\d{8}$/;
    return phoneRegex.test(phone);
  },

  // Validate vehicle plate number (Nepal)
  isValidNepaliPlate: (plate) => {
    const plateRegex = /^[A-Z]{2}\s?\d{1,4}\s?[A-Z]{0,3}$/;
    return plateRegex.test(plate);
  },

  // Validate password strength
  validatePasswordStrength: (password) => {
    const checks = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const strength = score < 3 ? "weak" : score < 5 ? "medium" : "strong";

    return { checks, score, strength };
  },

  // Sanitize input
  sanitizeInput: (input) => {
    if (typeof input !== "string") return input;
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/['"]/g, "") // Remove quotes
      .slice(0, 1000); // Limit length
  },
};

// Array utilities
const arrayHelpers = {
  // Remove duplicates from array
  removeDuplicates: (array) => {
    return [...new Set(array)];
  },

  // Group array by property
  groupBy: (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  },

  // Sort array by property
  sortBy: (array, key, direction = "asc") => {
    return array.sort((a, b) => {
      if (direction === "asc") {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
  },

  // Paginate array
  paginate: (array, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: array.slice(startIndex, endIndex),
      pagination: {
        current: page,
        pages: Math.ceil(array.length / limit),
        total: array.length,
        hasNext: endIndex < array.length,
        hasPrev: page > 1,
      },
    };
  },
};

// Crypto utilities
const cryptoHelpers = {
  // Generate hash
  generateHash: (data, algorithm = "sha256") => {
    return crypto.createHash(algorithm).update(data).digest("hex");
  },

  // Generate secure random token
  generateToken: (length = 32) => {
    return crypto.randomBytes(length).toString("hex");
  },

  // Encrypt data
  encrypt: (text, secretKey) => {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(secretKey, "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  },

  // Decrypt data
  decrypt: (encryptedData, secretKey) => {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(secretKey, "salt", 32);
    const [ivHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipher(algorithm, key);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  },
};

// JWT utilities
const jwtHelpers = {
  // Decode JWT without verification (for getting payload)
  decodeJWT: (token) => {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  },

  // Check if JWT is expired
  isJWTExpired: (token) => {
    const decoded = jwtHelpers.decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  },

  // Get time until JWT expires
  getJWTTimeToExpiry: (token) => {
    const decoded = jwtHelpers.decodeJWT(token);
    if (!decoded || !decoded.exp) return 0;
    return Math.max(0, decoded.exp * 1000 - Date.now());
  },
};

// Distance calculation utilities
const geoHelpers = {
  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance: (lat1, lon1, lat2, lon2, unit = "km") => {
    const R = unit === "km" ? 6371 : 3959; // Earth's radius in km or miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Check if point is within radius
  isWithinRadius: (lat1, lon1, lat2, lon2, radius, unit = "km") => {
    const distance = geoHelpers.calculateDistance(lat1, lon1, lat2, lon2, unit);
    return distance <= radius;
  },

  // Format coordinates for display
  formatCoordinates: (lat, lon, precision = 6) => {
    return `${Number(lat).toFixed(precision)}, ${Number(lon).toFixed(precision)}`;
  },
};

// API response helpers
const responseHelpers = {
  // Success response
  success: (res, message = "Success", data = null, statusCode = 200) => {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  },

  // Error response
  error: (
    res,
    message = "An error occurred",
    statusCode = 500,
    errors = null
  ) => {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  },

  // Paginated response
  paginated: (res, data, pagination, message = "Success") => {
    return res.json({
      success: true,
      message,
      count: data.length,
      pagination,
      data,
      timestamp: new Date().toISOString(),
    });
  },
};

module.exports = {
  dateHelpers,
  stringHelpers,
  numberHelpers,
  validationHelpers,
  arrayHelpers,
  cryptoHelpers,
  jwtHelpers,
  geoHelpers,
  responseHelpers,
};
