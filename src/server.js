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
      const userId = request.payload.userId;

      // --- LOGGING TAMBAHAN UNTUK DIAGNOSA ---
      console.log("Pusher Auth Request:");
      console.log("  socketId:", socketId);
      console.log("  channelName:", channelName);
      console.log("  userId:", userId);
      // --- AKHIR LOGGING TAMBAHAN ---

      if (!userId) {
        console.log("  Reason: userId is missing (returning 401).");
        return h
          .response({
            status: "fail",
            message: "User ID required for Pusher authentication.",
          })
          .code(401);
      }

      const channelPrefix = "private-chat-";
      if (channelName.startsWith(channelPrefix)) {
        const idPair = channelName.substring(channelPrefix.length); // Dapatkan bagian "id1_id2"
        const participantIds = idPair.split("_"); // Pisahkan dengan underscore

        if (participantIds.length === 2) {
          const participant1 = participantIds[0];
          const participant2 = participantIds[1];

          // --- LOGGING TAMBAHAN UNTUK DIAGNOSA ---
          console.log(
            "  Channel participants (parsed):",
            participant1,
            participant2
          );
          console.log("  Logged in userId (from frontend):", userId);
          // --- AKHIR LOGGING TAMBAHAN ---

          if (userId !== participant1 && userId !== participant2) {
            console.log(
              "  Reason: userId does not match channel participants (returning 403)."
            );
            return h
              .response({
                status: "fail",
                message: "Unauthorized to access this channel.",
              })
              .code(403);
          }
        } else {
          console.log(
            "  Reason: Invalid participant ID format in channel name (returning 403)."
          );
          return h
            .response({
              status: "fail",
              message: "Invalid channel name format.",
            })
            .code(403);
        }
      } else {
        console.log(
          "  Reason: Unsupported channel type or invalid channel name structure (returning 403)."
        );
        return h
          .response({
            status: "fail",
            message:
              "Unsupported channel type or invalid channel name structure.",
          })
          .code(403);
      }

      try {
        const authResponse = pusher.authorizeChannel(socketId, channelName, {
          user_id: userId,
        });
        console.log("  Pusher authorization successful (returning 200).");
        return h.response(authResponse).code(200);
      } catch (error) {
        console.error("Pusher authentication error:", error);
        console.log("  Reason: Pusher authorization failed (returning 500).");
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
