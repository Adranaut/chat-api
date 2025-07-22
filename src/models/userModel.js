const db = require("../utils/db");

class UserModel {
  static async create(name, phoneNumber, email, hashedPassword) {
    try {
      const query = `INSERT INTO users (name, phone_number, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, phone_number, email, created_at`;
      const values = [name, phoneNumber, email, hashedPassword];
      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      // Biarkan 'password' di sini karena ini digunakan untuk memverifikasi login
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
      // --- PERUBAHAN DI SINI: Hapus 'password' dari SELECT ---
      const query = `SELECT id, name, phone_number, email, created_at, updated_at FROM users WHERE id = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  static async updateName(id, newName) {
    try {
      const query = `UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`;
      const result = await db.query(query, [newName, id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating user name:", error);
      throw error;
    }
  }
}

module.exports = UserModel;
