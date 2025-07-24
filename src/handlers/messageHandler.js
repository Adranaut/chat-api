const encryption = require("../utils/encryption");
const MessageModel = require("../models/messageModel");
const UserModel = require("../models/userModel");
const pusher = require("../utils/pusher");

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

    if (newMessage) {
      const decryptedContent = encryption.decrypt(newMessage.encrypted_content);
      const messageData = {
        id: newMessage.id,
        senderId: newMessage.sender_id,
        receiverId: newMessage.receiver_id,
        content: decryptedContent,
        // Perbaikan: Pastikan createdAt selalu dalam format ISO string
        createdAt: new Date(newMessage.created_at).toISOString(),
      };

      // Gunakan underscore untuk menggabungkan ID agar tidak terpecah oleh UUID
      const channelName = `private-chat-${[senderId, receiverId]
        .sort()
        .join("_")}`;
      const eventName = "new-message";

      await pusher.trigger(channelName, eventName, messageData);
      console.log(
        `Pusher event '${eventName}' triggered on channel '${channelName}'`
      );
    }

    return h
      .response({
        status: "success",
        message: "Message sent successfully",
        data: {
          messageId: newMessage.id,
          // Perbaikan: Pastikan createdAt selalu dalam format ISO string di respons API
          createdAt: new Date(newMessage.created_at).toISOString(),
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
  const { user1Id, user2Id } = request.params;
  const { limit, offset } = request.query;

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

    const { messages, total } = await MessageModel.getConversation(
      user1Id,
      user2Id,
      limit,
      offset
    );

    const decryptedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: encryption.decrypt(msg.encrypted_content),
      created_at: new Date(msg.created_at).toISOString(), // Perbaikan: Pastikan juga untuk getMessages
    }));

    return h
      .response({
        status: "success",
        data: {
          messages: decryptedMessages,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            totalMessages: parseInt(total),
            nextOffset:
              parseInt(offset) + decryptedMessages.length < parseInt(total)
                ? parseInt(offset) + decryptedMessages.length
                : null,
            prevOffset:
              parseInt(offset) - parseInt(limit) >= 0
                ? parseInt(offset) - parseInt(limit)
                : null,
          },
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
