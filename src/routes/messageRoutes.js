// src/routes/messageRoutes.js
const Joi = require("@hapi/joi");
const messageHandler = require("../handlers/messageHandler"); // Pastikan ini diimpor

const messageRoutes = [
  {
    method: "POST",
    path: "/messages",
    handler: messageHandler.sendMessage, // Menggunakan handler dari messageHandler.js
    options: {
      auth: "jwt",
      validate: {
        payload: Joi.object({
          receiverId: Joi.string().required(),
          content: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/messages/{userId}",
    handler: messageHandler.getMessages, // Menggunakan handler dari messageHandler.js
    options: {
      auth: "jwt",
      validate: {
        params: Joi.object({
          userId: Joi.string().required(),
        }),
      },
    },
  },
];

module.exports = messageRoutes;
