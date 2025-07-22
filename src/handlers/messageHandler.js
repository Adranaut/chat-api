const encryption = require("../utils/encryption");
const MessageModel = require("../models/messageModel");
const UserModel = require("../models/userModel"); // Mungkin diperlukan untuk validasi receiverId

const sendMessage = async (request, h) => {
  const { senderId, receiverId, content } = request.payload; // senderId harus dikirim dari client atau didapat dari sesi

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
  const { user1Id, user2Id } = request.query; // Ambil ID user dari query params, atau dari path params

  if (!user1Id || !user2Id) {
    return h
      .response({
        status: "fail",
        message: "user1Id and user2Id are required to fetch messages.",
      })
      .code(400);
  }

  try {
    const messages = await MessageModel.getConversation(user1Id, user2Id);

    const decryptedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: encryption.decrypt(msg.encrypted_content),
      createdAt: msg.created_at,
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
