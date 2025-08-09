const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthService {
  static generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  static async validateCredentials(username, password) {
    const user = await User.findByEmailOrUsername(username).populate(
      "assignedLocations",
      "name address"
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account deactivated");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    return user;
  }

  static async createUser(userData) {
    const { username, email, password, firstName, lastName, phoneNumber } = userData;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "email" : "username";
      throw new Error(`User with this ${field} already exists`);
    }

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    });

    return user;
  }

  static async updateLastLogin(userId) {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() }, { new: true });
  }

  static formatUserResponse(user, token = null) {
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isActive: user.isActive,
      vehicles: user.vehicles,
      assignedLocations: user.assignedLocations,
      lastLogin: user.lastLogin,
      accountCreatedAt: user.accountCreatedAt,
    };

    if (token) {
      return { user: userResponse, token };
    }

    return userResponse;
  }
}

module.exports = AuthService;