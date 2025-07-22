const Hapi = require("@hapi/hapi");
// const Jwt = require('@hapi/jwt'); // Hapus import Jwt
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
require("dotenv").config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.NODE_ENV !== "production" ? "0.0.0.0" : "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"], // Sesuaikan dengan origin aplikasi Android Anda
      },
    },
  });

  // --- HAPUS SELURUH BAGIAN REGISTRASI DAN STRATEGI JWT INI ---
  // await server.register(Jwt);
  // server.auth.strategy('jwt', 'jwt', { ... });
  // server.auth.default('jwt');

  // Daftarkan rute-rute aplikasi Anda
  server.route(userRoutes);
  server.route(messageRoutes);

  // Rute dasar (tetap tanpa autentikasi)
  server.route({
    method: "GET",
    path: "/",
    options: {
      auth: false, // Tidak ada autentikasi default, jadi ini opsional tapi bagus
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
