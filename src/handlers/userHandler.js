const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");
const Jwt = require("jsonwebtoken");

// --- PASTIKAN SEMUA FUNGSI DEKLARASI DULU, BARU EXPORT DI BAWAH ---

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
    const userId = request.auth.credentials.id;

    const user = await UserModel.findById(userId);

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
          phone_number: user.phone_number,
          created_at: user.created_at,
          updated_at: user.updated_at,
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

// --- BAGIAN EXPORT INI HARUS DI PALING BAWAH SETELAH SEMUA FUNGSI DEKLARASI ---
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserName, // Tambahkan ini jika Anda mengimplementasikan updateUserName
};
