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

    let formattedCreatedAt = null;
    if (newMessage && newMessage.created_at) {
      const dateObj = new Date(newMessage.created_at);
      if (!isNaN(dateObj.getTime())) {
        // Check if date is valid
        formattedCreatedAt = dateObj.toISOString();
      } else {
        // Fallback if created_at from DB is somehow invalid
        console.warn(
          "Invalid created_at from DB for new message:",
          newMessage.created_at
        );
        formattedCreatedAt = new Date().toISOString(); // Use current time as fallback
      }
    } else {
      // Fallback if created_at is missing from DB response
      console.warn("Missing created_at from DB for new message.");
      formattedCreatedAt = new Date().toISOString(); // Use current time as fallback
    }

    if (newMessage) {
      const decryptedContent = encryption.decrypt(newMessage.encrypted_content);
      const messageData = {
        id: newMessage.id,
        senderId: newMessage.sender_id,
        receiverId: newMessage.receiver_id,
        content: decryptedContent,
        createdAt: formattedCreatedAt, // Use the validated/formatted timestamp
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
          createdAt: formattedCreatedAt, // Use the validated/formatted timestamp in API response
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

    const decryptedMessages = messages.map((msg) => {
      let formattedCreatedAt = null;
      if (msg.created_at) {
        const dateObj = new Date(msg.created_at);
        if (!isNaN(dateObj.getTime())) {
          // Check if date is valid
          formattedCreatedAt = dateObj.toISOString();
        } else {
          console.warn(
            "Invalid created_at from DB for historical message:",
            msg.created_at
          );
          formattedCreatedAt = new Date().toISOString(); // Fallback
        }
      } else {
        console.warn("Missing created_at from DB for historical message.");
        formattedCreatedAt = new Date().toISOString(); // Fallback
      }

      return {
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: encryption.decrypt(msg.encrypted_content),
        created_at: formattedCreatedAt, // Use the validated/formatted timestamp
      };
    });

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
