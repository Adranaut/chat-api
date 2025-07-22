const Joi = require("@hapi/joi");
const messageHandler = require("../handlers/messageHandler");

const messageRoutes = [
  {
    method: "POST",
    path: "/messages",
    handler: messageHandler.sendMessage,
    options: {
      validate: {
        payload: Joi.object({
          senderId: Joi.string().required(), // Diperlukan karena tidak ada autentikasi otomatis
          receiverId: Joi.string().required(),
          content: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/messages", // Menggunakan query params untuk user1Id dan user2Id
    handler: messageHandler.getMessages,
    options: {
      validate: {
        query: Joi.object({
          user1Id: Joi.string().required(),
          user2Id: Joi.string().required(),
        }),
      },
    },
  },
];

module.exports = messageRoutes;
