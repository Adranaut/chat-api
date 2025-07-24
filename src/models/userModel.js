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

  // Fungsi ini akan digunakan untuk login (memerlukan password)
  static async findByEmailForAuth(email) {
    try {
      const query = `SELECT id, name, phone_number, email, password FROM users WHERE email = $1`;
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by email for auth:", error);
      throw error;
    }
  }

  // Fungsi ini akan digunakan untuk mendapatkan profil (tanpa password)
  static async findByEmail(email) {
    try {
      const query = `SELECT id, name, phone_number, email, created_at, updated_at FROM users WHERE email = $1`;
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
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
      const query = `UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETATING id`;
      const result = await db.query(query, [newName, id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating user name:", error);
      throw error;
    }
  }

  // --- FUNGSI BARU DITAMBAHKAN DI SINI ---
  static async findByPhoneNumber(phoneNumber) {
    try {
      const query = `SELECT id, name, phone_number, email FROM users WHERE phone_number = $1`;
      const result = await db.query(query, [phoneNumber]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by phone number:", error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const query = `SELECT id, name, phone_number, email FROM users ORDER BY name ASC`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }
}

module.exports = UserModel;
