const Joi = require("@hapi/joi");
const userHandler = require("../handlers/userHandler");

const userRoutes = [
  {
    method: "POST",
    path: "/users/register",
    handler: userHandler.registerUser,
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).max(255).required(),
          phone_number: Joi.string()
            .pattern(/^\+?[0-9]{10,15}$/)
            .required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/users/login",
    handler: userHandler.loginUser,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/users/profile/{userId}",
    handler: userHandler.getUserProfile,
    options: {
      validate: {
        params: Joi.object({
          userId: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/users/name/{userId}",
    handler: userHandler.updateUserName,
    options: {
      validate: {
        params: Joi.object({
          userId: Joi.string().required(),
        }),
        payload: Joi.object({
          name: Joi.string().min(3).max(255).required(),
        }),
      },
    },
  },
  // --- RUTE BARU DITAMBAHKAN DI SINI ---
  {
    method: "GET",
    path: "/users",
    handler: userHandler.getAllUsers,
    options: {
      auth: false,
    },
  },
  {
    method: "GET",
    path: "/users/search",
    handler: userHandler.findUserByPhoneNumber,
    options: {
      validate: {
        query: Joi.object({
          phoneNumber: Joi.string()
            .pattern(/^\+?[0-9]{10,15}$/)
            .required(),
        }),
      },
      auth: false,
    },
  },
];

module.exports = userRoutes;
