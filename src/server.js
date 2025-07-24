const Hapi = require("@hapi/hapi");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const pusher = require("./utils/pusher"); // Import pusher utility
require("dotenv").config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.NODE_ENV !== "production" ? "0.0.0.0" : "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"], // Sesuaikan dengan origin aplikasi Android Anda
        credentials: true, // Penting untuk otentikasi Pusher
      },
    },
  });

  server.route(userRoutes);
  server.route(messageRoutes);

  server.route({
    method: "POST",
    path: "/pusher/auth",
    handler: async (request, h) => {
      const socketId = request.payload.socket_id;
      const channelName = request.payload.channel_name;
      const userId = request.payload.userId; // <--- PASTIKAN INI DITERIMA DARI FRONTEND

      if (!userId) {
        // Ini akan menyebabkan 401 jika userId tidak ada
        return h
          .response({
            status: "fail",
            message: "User ID required for Pusher authentication.",
          })
          .code(401);
      }

      // Pastikan pengguna diizinkan untuk berlangganan saluran ini
      const channelParts = channelName.split("-");
      if (channelParts[0] === "private" && channelParts[1] === "chat") {
        const participant1 = channelParts[2];
        const participant2 = channelParts[3];
        // Ini akan menyebabkan 403 jika userId tidak cocok
        if (userId !== participant1 && userId !== participant2) {
          return h
            .response({
              status: "fail",
              message: "Unauthorized to access this channel.",
            })
            .code(403);
        }
      } else {
        // Ini akan menyebabkan 403 jika channel type tidak didukung
        return h
          .response({ status: "fail", message: "Unsupported channel type." })
          .code(403);
      }

      try {
        const authResponse = pusher.authorizeChannel(socketId, channelName, {
          user_id: userId,
        });
        return h.response(authResponse).code(200);
      } catch (error) {
        console.error("Pusher authentication error:", error);
        return h
          .response({
            status: "error",
            message: "Pusher authentication failed.",
          })
          .code(500);
      }
    },
    options: {
      auth: false,
    },
  });

  server.route({
    method: "GET",
    path: "/",
    options: {
      auth: false,
    },
    handler: (request, h) => {
      return "Chat API is running!";
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
