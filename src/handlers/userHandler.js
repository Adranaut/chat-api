const bcrypt = require("bcrypt");
const UserModel = require("../models/userModel");

const registerUser = async (request, h) => {
  const { name, phone_number, email, password } = request.payload;

  try {
    const existingUserByEmail = await UserModel.findByEmailForAuth(email);
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

    return h
      .response({
        status: "success",
        message: "Login successful",
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
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
  const { userId } = request.params;

  try {
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
  const { userId } = request.params;
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

// --- FUNGSI BARU DITAMBAHKAN DI SINI ---
const getAllUsers = async (request, h) => {
  try {
    const users = await UserModel.getAllUsers();
    const publicUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      phone_number: user.phone_number,
      email: user.email,
    }));
    return h
      .response({
        status: "success",
        data: { users: publicUsers },
      })
      .code(200);
  } catch (error) {
    console.error("Error getting all users:", error);
    return h
      .response({
        status: "error",
        message: "Failed to retrieve users.",
      })
      .code(500);
  }
};

const findUserByPhoneNumber = async (request, h) => {
  const { phoneNumber } = request.query;

  if (!phoneNumber) {
    return h
      .response({ status: "fail", message: "Phone number is required." })
      .code(400);
  }

  try {
    const user = await UserModel.findByPhoneNumber(phoneNumber);
    if (!user) {
      return h
        .response({ status: "fail", message: "User not found." })
        .code(404);
    }
    return h
      .response({
        status: "success",
        data: {
          id: user.id,
          name: user.name,
          phone_number: user.phone_number,
          email: user.email,
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error finding user by phone number:", error);
    return h
      .response({ status: "error", message: "Failed to find user." })
      .code(500);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserName,
  getAllUsers,
  findUserByPhoneNumber,
};
