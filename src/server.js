const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt"); // Import plugin JWT
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

  // --- Registrasi Plugin JWT ---
  await server.register(Jwt);

  // --- Konfigurasi Strategi Autentikasi JWT ---
  // Strategi ini akan memverifikasi token yang masuk
  server.auth.strategy("jwt", "jwt", {
    keys: process.env.JWT_SECRET, // Kunci rahasia dari .env
    verify: {
      aud: false, // Audience tidak diwajibkan
      iss: false, // Issuer tidak diwajibkan
      sub: false, // Subject tidak diwajibkan
      nbf: true, // Not Before: token tidak berlaku sebelum waktu tertentu
      exp: true, // Expiration: token harus memiliki waktu kadaluarsa
      maxAgeSec: 14400, // Token berlaku 4 jam (4 * 60 * 60 detik)
      timeSkewSec: 15, // Fleksibilitas waktu (detik) untuk perbedaan jam server
    },
    validate: (artifacts, request, h) => {
      // Fungsi ini dipanggil setelah token berhasil diverifikasi oleh @hapi/jwt
      // artifacts.decoded berisi payload JWT yang telah didekode
      // Anda bisa melakukan validasi tambahan di sini, misalnya cek ke database
      const credentials = {
        id: artifacts.decoded.id,
        email: artifacts.decoded.email,
        name: artifacts.decoded.name, // Ambil nama dari payload token
      };
      return {
        isValid: true, // Token valid
        credentials, // Kredensial pengguna yang akan tersedia di request.auth.credentials
      };
    },
  });

  // --- Terapkan strategi 'jwt' sebagai default untuk semua rute ---
  // Ini berarti semua rute akan membutuhkan token JWT yang valid secara default,
  // kecuali rute tersebut secara eksplisit diset options: { auth: false }.
  server.auth.default("jwt");

  // Daftarkan rute-rute aplikasi Anda
  server.route(userRoutes);
  server.route(messageRoutes);

  // Contoh rute dasar (penting: set auth: false agar bisa diakses publik)
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
