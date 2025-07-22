const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");
// const Jwt = require('jsonwebtoken'); // Hapus import Jwt

const registerUser = async (request, h) => {
  const { name, phone_number, email, password } = request.payload;

  try {
    const existingUserByEmail = await UserModel.findByEmailForAuth(email); // Menggunakan findByEmailForAuth
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
    const user = await UserModel.findByEmailForAuth(email); // Menggunakan findByEmailForAuth
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

    // --- HAPUS BAGIAN PEMBUATAN TOKEN JWT ---
    // const tokenPayload = { ... };
    // const token = Jwt.sign(...);

    // Mengembalikan detail user langsung (tanpa token)
    return h
      .response({
        status: "success",
        message: "Login successful",
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number, // Sertakan phone_number juga
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
  // Dengan tidak adanya JWT, kita TIDAK BISA mendapatkan ID/Email dari token.
  // Anda harus mengirimkan ID user di path parameter atau query parameter.
  // Asumsi: Kita akan mengambil ID dari path params.
  const { userId } = request.params; // Ambil ID dari path params, misal /users/profile/some-id

  try {
    const user = await UserModel.findById(userId); // Menggunakan findById

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
  // Dengan tidak adanya JWT, Anda harus mengirim ID user yang akan diupdate
  // Asumsi: ID user ada di path params
  const { userId } = request.params; // Ambil ID dari path params, misal /users/name/some-id
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserName,
};
