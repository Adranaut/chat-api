const db = require("../utils/db");

class MessageModel {
  static async create(senderId, receiverId, encryptedContent) {
    try {
      const query = `INSERT INTO messages (sender_id, receiver_id, encrypted_content) VALUES ($1, $2, $3) RETURNING id, sender_id, receiver_id, created_at`;
      const values = [senderId, receiverId, encryptedContent];
      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  static async getConversation(user1Id, user2Id) {
    try {
      const query = `
                SELECT id, sender_id, receiver_id, encrypted_content, created_at
                FROM messages
                WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
                ORDER BY created_at ASC;
            `;
      const values = [user1Id, user2Id];
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw error;
    }
  }
}

module.exports = MessageModel;
