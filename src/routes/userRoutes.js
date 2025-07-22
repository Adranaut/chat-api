const Joi = require("@hapi/joi");
const userHandler = require("../handlers/userHandler");

const userRoutes = [
  {
    method: "POST",
    path: "/users/register",
    handler: userHandler.registerUser,
    options: {
      auth: false,
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
      auth: false,
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required(),
        }),
      },
    },
  },
  // --- RUTE GET USER PROFILE INI HARUS ADA ---
  {
    method: "GET",
    path: "/users/profile", // Pastikan path ini benar
    handler: userHandler.getUserProfile, // Pastikan handler ini ada di userHandler.js
    options: {
      auth: "jwt", // Rute ini memerlukan autentikasi JWT
    },
  },
];

module.exports = userRoutes;
