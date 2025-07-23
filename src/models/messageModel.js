const db = require("../utils/db");

class MessageModel {
  static async create(senderId, receiverId, encryptedContent) {
    try {
      const query = `INSERT INTO messages (sender_id, receiver_id, encrypted_content) VALUES ($1, $2, $3) RETURNING id, sender_id, receiver_id, encrypted_content, created_at`;
      const values = [senderId, receiverId, encryptedContent];
      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  // Fungsi getConversation diubah untuk paginasi
  static async getConversation(user1Id, user2Id, limit, offset) {
    // <--- TAMBAHAN PARAMETER
    try {
      // Query untuk mendapatkan pesan dengan limit dan offset
      const messagesQuery = `
                SELECT id, sender_id, receiver_id, encrypted_content, created_at
                FROM messages
                WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
                ORDER BY created_at DESC
                LIMIT $3 OFFSET $4;
            `;
      const messagesValues = [user1Id, user2Id, limit, offset];
      const messagesResult = await db.query(messagesQuery, messagesValues);

      // Query untuk mendapatkan total jumlah pesan (tanpa paginasi)
      const totalQuery = `
                SELECT COUNT(*) as total
                FROM messages
                WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1);
            `;
      const totalResult = await db.query(totalQuery, [user1Id, user2Id]);
      const totalMessages = totalResult.rows[0].total;

      return {
        messages: messagesResult.rows,
        total: totalMessages,
      }; // Mengembalikan objek dengan pesan dan total
    } catch (error) {
      console.error("Error fetching paginated conversation:", error);
      throw error;
    }
  }
}

module.exports = MessageModel;
