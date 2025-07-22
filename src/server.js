const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt"); // Pastikan ini di-import
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
require("dotenv").config();

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

  // --- PASTIKAN BAGIAN INI ADA DAN URUTANNYA BENAR ---
  await server.register(Jwt); // Mendaftarkan plugin JWT

  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 14400,
      timeSkewSec: 15,
    },
    validate: (artifacts, request, h) => {
      const credentials = {
        id: artifacts.decoded.id,
        email: artifacts.decoded.email,
        name: artifacts.decoded.name, // Pastikan 'name' ada di payload token saat login
      };
      return {
        isValid: true,
        credentials,
      };
    },
  });

  server.auth.default("jwt"); // Mengatur strategi 'jwt' sebagai default

  // --- PASTIKAN DAFTAR RUTE DI SINI ---
  server.route(userRoutes);
  server.route(messageRoutes);

  // Rute dasar tanpa autentikasi
  server.route({
    method: "GET",
    path: "/",
    options: {
      auth: false, // Rute ini tidak memerlukan autentikasi
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
