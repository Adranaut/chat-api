const Joi = require("@hapi/joi");
const messageHandler = require("../handlers/messageHandler");

const messageRoutes = [
  {
    method: "POST",
    path: "/messages",
    handler: messageHandler.sendMessage,
    options: {
      // auth: 'jwt', // HAPUS OPSI AUTH INI
      validate: {
        payload: Joi.object({
          senderId: Joi.string().required(), // PERLU dikirim karena tidak ada token
          receiverId: Joi.string().required(),
          content: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/messages/{user1Id}/{user2Id}", // <--- PERUBAHAN DI SINI: path params untuk kedua ID
    handler: messageHandler.getMessages,
    options: {
      // auth: 'jwt', // HAPUS OPSI AUTH INI
      validate: {
        params: Joi.object({
          user1Id: Joi.string().required(),
          user2Id: Joi.string().required(),
        }),
      },
    },
  },
];

module.exports = messageRoutes;
