const Joi = require("@hapi/joi");
const messageHandler = require("../handlers/messageHandler");

const messageRoutes = [
  {
    method: "POST",
    path: "/messages",
    handler: messageHandler.sendMessage,
    options: {
      auth: "jwt", // Rute ini memerlukan autentikasi JWT
      validate: {
        payload: Joi.object({
          // senderId tidak lagi dikirim di payload, akan diambil dari token
          receiverId: Joi.string().required(),
          content: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/messages/{userId}", // Menggunakan path parameter untuk ID user lawan bicara
    handler: messageHandler.getMessages,
    options: {
      auth: "jwt", // Rute ini memerlukan autentikasi JWT
      validate: {
        params: Joi.object({
          userId: Joi.string().required(), // Validasi path parameter
        }),
      },
    },
  },
];

module.exports = messageRoutes;
