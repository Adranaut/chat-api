const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");
const Jwt = require("jsonwebtoken");

// ... (fungsi registerUser) ...

const loginUser = async (request, h) => {
  const { email, password } = request.payload;

  try {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return h
        .response({
          status: "fail",
          message: "Invalid email or password",
        })
        .code(401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return h
        .response({
          status: "fail",
          message: "Invalid email or password",
        })
        .code(401);
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name, // Pastikan nama ada di sini
    };

    const token = Jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "4h",
      algorithm: "HS256",
    });

    return h
      .response({
        status: "success",
        message: "Login successful",
        data: {
          token,
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error logging in user:", error);
    return h
      .response({
        status: "error",
        message: "Failed to login",
      })
      .code(500);
  }
};

// --- FUNGSI INI HARUS ADA ---
const getUserProfile = async (request, h) => {
  try {
    const userId = request.auth.credentials.id; // Ambil ID dari token

    const user = await UserModel.findById(userId); // Ambil data lengkap dari database

    if (!user) {
      return h
        .response({
          status: "fail",
          message: "User not found.",
        })
        .code(404);
    }

    return h
      .response({
        status: "success",
        message: "User profile retrieved successfully",
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number, // Gunakan phone_number, bukan phoneNumber
          created_at: user.created_at, // Gunakan created_at, bukan createdAt
          updated_at: user.updated_at, // Gunakan updated_at, bukan updatedAt
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return h
      .response({
        status: "error",
        message: "Failed to retrieve user profile.",
      })
      .code(500);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile, // Pastikan ini diekspor!
};
