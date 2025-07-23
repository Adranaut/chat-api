// src/handlers/messageHandler.js
const encryption = require("../utils/encryption");
const MessageModel = require("../models/messageModel");
const UserModel = require("../models/userModel");
const pusher = require("../utils/pusher"); // Import objek Pusher yang sudah diinisialisasi

const sendMessage = async (request, h) => {
  const { senderId, receiverId, content } = request.payload;

  try {
    const senderExists = await UserModel.findById(senderId);
    if (!senderExists) {
      return h
        .response({
          status: "fail",
          message: "Sender user not found",
        })
        .code(404);
    }

    const receiverExists = await UserModel.findById(receiverId);
    if (!receiverExists) {
      return h
        .response({
          status: "fail",
          message: "Receiver user not found",
        })
        .code(404);
    }

    const encryptedContent = encryption.encrypt(content);
    const newMessage = await MessageModel.create(
      senderId,
      receiverId,
      encryptedContent
    );

    // --- Tambahan Kode untuk Pusher ---
    if (newMessage) {
      const decryptedContent = encryption.decrypt(newMessage.encrypted_content); // Dekripsi untuk dikirim via Pusher
      const messageData = {
        id: newMessage.id,
        senderId: newMessage.sender_id,
        receiverId: newMessage.receiver_id,
        content: decryptedContent, // Kirim pesan yang sudah didekripsi
        createdAt: newMessage.created_at,
      };

      // Tentukan channel. Contoh: 'private-chat-SENDERID-RECEIVERID'
      // Untuk percakapan 1-ke-1, channel harus konsisten antara kedua pihak.
      // Bisa diurutkan ID untuk konsistensi: `chat-${[senderId, receiverId].sort().join('-')}`
      const channelName = `private-chat-${[senderId, receiverId]
        .sort()
        .join("-")}`;
      const eventName = "new-message"; // Nama event

      await pusher.trigger(channelName, eventName, messageData);
      console.log(
        `Pusher event '${eventName}' triggered on channel '${channelName}'`
      );
    }
    // --- Akhir Tambahan Kode Pusher ---

    return h
      .response({
        status: "success",
        message: "Message sent successfully",
        data: {
          messageId: newMessage.id,
        },
      })
      .code(201);
  } catch (error) {
    console.error("Error sending message:", error);
    return h
      .response({
        status: "error",
        message: "Failed to send message",
      })
      .code(500);
  }
};

// ... (getMessages) ...

module.exports = {
  sendMessage,
  getMessages,
};
