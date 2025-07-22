const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ambil dari .env
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false, // Diperlukan untuk deployment di platform seperti Vercel dengan database pihak ketiga
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
