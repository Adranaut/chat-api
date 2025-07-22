const db = require("../utils/db");

class UserModel {
  static async create(phoneNumber, email, hashedPassword) {
    try {
      const query = `INSERT INTO users (phone_number, email, password) VALUES ($1, $2, $3) RETURNING id, phone_number, email, created_at`;
      const values = [phoneNumber, email, hashedPassword];
      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const query = `SELECT id, phone_number, email, password FROM users WHERE email = $1`;
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `SELECT id, phone_number, email FROM users WHERE id = $1`;
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }
}

module.exports = UserModel;
