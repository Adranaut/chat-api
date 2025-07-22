const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
require("dotenv").config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.NODE_ENV !== "production" ? "0.0.0.0" : "0.0.0.0", // '0.0.0.0' untuk Vercel
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register(Jwt);

  server.auth.strategy("jwt", "jwt", {
    secret: process.env.JWT_SECRET, // <--- PERUBAHAN DI SINI: dari 'keys' menjadi 'secret'
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
        name: artifacts.decoded.name,
      };
      return {
        isValid: true,
        credentials,
      };
    },
  });

  server.auth.default("jwt");

  server.route(userRoutes);
  server.route(messageRoutes);

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
