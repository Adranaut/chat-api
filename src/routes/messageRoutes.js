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
          senderId: Joi.string().required(),
          receiverId: Joi.string().required(),
          content: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/messages/{user1Id}/{user2Id}",
    handler: messageHandler.getMessages,
    options: {
      validate: {
        params: Joi.object({
          user1Id: Joi.string().required(),
          user2Id: Joi.string().required(),
        }),
        query: Joi.object({
          // <--- TAMBAHAN UNTUK PAGINASI
          limit: Joi.number().integer().min(1).default(20), // Default 20 pesan per halaman
          offset: Joi.number().integer().min(0).default(0), // Default mulai dari 0 (halaman pertama)
        }).options({ allowUnknown: true }), // Izinkan query params lain jika ada
      },
    },
  },
];

module.exports = messageRoutes;
