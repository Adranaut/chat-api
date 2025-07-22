const Hapi = require("@hapi/hapi");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
require("dotenv").config(); // Untuk memuat variabel lingkungan

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"], // Sesuaikan dengan origin aplikasi Android Anda
      },
    },
  });

  // Daftarkan rute
  server.route(userRoutes);
  server.route(messageRoutes);

  // Contoh rute dasar
  server.route({
    method: "GET",
    path: "/",
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
