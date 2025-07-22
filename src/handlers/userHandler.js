const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");
const Jwt = require("jsonwebtoken"); // Import jsonwebtoken untuk membuat token

const registerUser = async (request, h) => {
  const { name, phone_number, email, password } = request.payload;

  try {
    const existingUserByEmail = await UserModel.findByEmail(email);
    if (existingUserByEmail) {
      return h
        .response({
          status: "fail",
          message: "Email already registered",
        })
        .code(409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create(
      name,
      phone_number,
      email,
      hashedPassword
    );

    if (!newUser) {
      throw new Error("Failed to create new user in database.");
    }

    return h
      .response({
        status: "success",
        message: "User registered successfully",
        data: {
          userId: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      })
      .code(201);
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === "23505") {
      return h
        .response({
          status: "fail",
          message: "Phone number or email already registered",
        })
        .code(409);
    }
    return h
      .response({
        status: "error",
        message: "Failed to register user",
      })
      .code(500);
  }
};

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

    // --- Buat JWT Token ---
    // Payload token: data yang ingin Anda sertakan (id, email, nama user)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name, // Sertakan nama di payload token
    };

    const token = Jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET, // Kunci rahasia dari .env
      {
        expiresIn: "4h", // Token berlaku selama 4 jam (bisa disesuaikan)
        algorithm: "HS256", // Algoritma penandatanganan
      }
    );

    return h
      .response({
        status: "success",
        message: "Login successful",
        data: {
          token, // Kirim token kembali ke klien
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

// Tambahkan handler untuk mendapatkan profil user, yang membutuhkan autentikasi
const getUserProfile = async (request, h) => {
  // request.auth.credentials akan berisi payload dari token yang valid
  // yang didefinisikan di server.auth.strategy
  return h
    .response({
      status: "success",
      message: "User profile retrieved successfully",
      data: request.auth.credentials, // Mengandung id, email, dan nama
    })
    .code(200);
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile, // Export handler baru
};
