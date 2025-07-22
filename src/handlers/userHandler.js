const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");

const registerUser = async (request, h) => {
  const { phone_number, email, password } = request.payload;

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
    const newUser = await UserModel.create(phone_number, email, hashedPassword);

    if (!newUser) {
      throw new Error("Failed to create new user in database.");
    }

    return h
      .response({
        status: "success",
        message: "User registered successfully",
        data: {
          userId: newUser.id,
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

    // --- Di sini adalah bagian di mana token akan dibuat jika JWT diimplementasikan ---
    // Untuk saat ini, kita hanya mengembalikan pesan sukses
    return h
      .response({
        status: "success",
        message: "Login successful",
        data: {
          userId: user.id, // ID user yang login
          email: user.email,
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

module.exports = {
  registerUser,
  loginUser,
};
