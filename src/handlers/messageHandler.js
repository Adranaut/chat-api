const encryption = require("../utils/encryption");
const MessageModel = require("../models/messageModel");
const UserModel = require("../models/userModel");

const sendMessage = async (request, h) => {
  // --- PERUBAHAN DI SINI: senderId harus dikirim dari payload ---
  const { senderId, receiverId, content } = request.payload;

  try {
    const senderExists = await UserModel.findById(senderId); // Tambahkan validasi senderId
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

const getMessages = async (request, h) => {
  // --- PERUBAHAN DI SINI: Ambil kedua ID dari path params ---
  const { user1Id, user2Id } = request.params; // Misal: /messages/user1_id/user2_id

  try {
    const user1Exists = await UserModel.findById(user1Id);
    if (!user1Exists) {
      return h
        .response({
          status: "fail",
          message: "User 1 not found",
        })
        .code(404);
    }
    const user2Exists = await UserModel.findById(user2Id);
    if (!user2Exists) {
      return h
        .response({
          status: "fail",
          message: "User 2 not found",
        })
        .code(404);
    }

    const messages = await MessageModel.getConversation(user1Id, user2Id);

    const decryptedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: encryption.decrypt(msg.encrypted_content),
      created_at: msg.created_at,
    }));

    return h
      .response({
        status: "success",
        data: {
          messages: decryptedMessages,
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return h
      .response({
        status: "error",
        message: "Failed to retrieve messages",
      })
      .code(500);
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
