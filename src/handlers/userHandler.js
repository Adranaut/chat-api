const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");
const Jwt = require("jsonwebtoken");

// --- PASTIKAN SEMUA DEKLARASI FUNGSI DI SINI ---
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
    // PERUBAHAN DI SINI: Panggil findByEmailForAuth
    const user = await UserModel.findByEmailForAuth(email);
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
      name: user.name,
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

const getUserProfile = async (request, h) => {
  try {
    // Ambil EMAIL pengguna dari kredensial token yang sudah divalidasi
    const userEmail = request.auth.credentials.email; // <--- PERUBAHAN DI SINI

    // Ambil data user lengkap dari database menggunakan EMAIL (bukan ID)
    const user = await UserModel.findByEmail(userEmail); // <--- PERUBAHAN DI SINI

    if (!user) {
      // Ini seharusnya sangat jarang terjadi jika token valid dan email ada di DB
      return h
        .response({
          status: "fail",
          message: "User profile not found in database for this email.",
        })
        .code(404);
    }

    // Kembalikan data user lengkap (tanpa password)
    return h
      .response({
        status: "success",
        message: "User profile retrieved successfully (via email lookup)",
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error retrieving user profile (via email):", error);
    return h
      .response({
        status: "error",
        message: "Failed to retrieve user profile (via email).",
      })
      .code(500);
  }
};

const updateUserName = async (request, h) => {
  const userId = request.auth.credentials.id;
  const { name } = request.payload;

  try {
    if (!name || name.trim() === "") {
      return h
        .response({
          status: "fail",
          message: "Name cannot be empty.",
        })
        .code(400);
    }

    const success = await UserModel.updateName(userId, name);

    if (!success) {
      return h
        .response({
          status: "fail",
          message: "User not found or unable to update name.",
        })
        .code(404);
    }

    return h
      .response({
        status: "success",
        message: "User name updated successfully",
        data: {
          userId,
          newName: name,
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error updating user name:", error);
    return h
      .response({
        status: "error",
        message: "Failed to update user name.",
      })
      .code(500);
  }
};

// --- PASTIKAN BAGIAN EXPORT INI DI PALING BAWAH ---
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserName,
  // HAPUS "sendMessage," dan "getMessages," dari sini jika mereka di messageHandler.js
};
