const Joi = require("@hapi/joi");
const userHandler = require("../handlers/userHandler");

const userRoutes = [
  {
    method: "POST",
    path: "/users/register",
    handler: userHandler.registerUser,
    options: {
      // auth: false, // Tidak perlu lagi karena tidak ada auth default
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
      // auth: false,
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
    path: "/users/profile/{userId}", // <--- PERUBAHAN DI SINI: tambahkan path parameter userId
    handler: userHandler.getUserProfile,
    options: {
      // auth: 'jwt', // HAPUS OPSI AUTH INI
      validate: {
        params: Joi.object({
          userId: Joi.string().required(), // Validasi path parameter
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/users/name/{userId}", // <--- PERUBAHAN DI SINI: tambahkan path parameter userId
    handler: userHandler.updateUserName,
    options: {
      // auth: 'jwt', // HAPUS OPSI AUTH INI
      validate: {
        params: Joi.object({
          userId: Joi.string().required(), // Validasi path parameter
        }),
        payload: Joi.object({
          name: Joi.string().min(3).max(255).required(),
        }),
      },
    },
  },
];

module.exports = userRoutes;
