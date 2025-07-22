// src/handlers/messageHandler.js
const encryption = require("../utils/encryption");
const MessageModel = require("../models/messageModel");
const UserModel = require("../models/userModel"); // Mungkin diperlukan untuk validasi receiverId

const sendMessage = async (request, h) => {
  const { receiverId, content } = request.payload;
  const senderId = request.auth.credentials.id; // Ambil senderId dari payload JWT

  try {
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
  const { userId: targetUserId } = request.params; // Ambil ID user lawan bicara dari path params
  const currentUserId = request.auth.credentials.id; // Ambil ID user yang sedang login dari payload JWT

  try {
    const targetUserExists = await UserModel.findById(targetUserId);
    if (!targetUserExists) {
      return h
        .response({
          status: "fail",
          message: "Target user for conversation not found",
        })
        .code(404);
    }

    const messages = await MessageModel.getConversation(
      currentUserId,
      targetUserId
    );

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
