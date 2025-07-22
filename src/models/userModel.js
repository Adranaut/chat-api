const db = require("../utils/db");

class UserModel {
  static async create(name, phoneNumber, email, hashedPassword) {
    // Tambah 'name' di parameter
    try {
      const query = `INSERT INTO users (name, phone_number, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, phone_number, email, created_at`; // Tambah 'name' di query
      const values = [name, phoneNumber, email, hashedPassword]; // Tambah 'name' di values
      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      // Tambah 'name' di SELECT
      const query = `SELECT id, name, phone_number, email, password FROM users WHERE email = $1`;
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      // Tambah 'name' di SELECT
      const query = `SELECT id, name, phone_number, email FROM users WHERE id = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }
}

module.exports = UserModel;
