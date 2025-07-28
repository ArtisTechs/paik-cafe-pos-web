import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_URL } from "../enum";
import { formatDate } from "./date-services";
import { DateFormat } from "../enum/date-format.enum";
import axios from "axios";
import { getTokenAsync } from "./global-services";

const protocol = window.location.protocol === "https:" ? "https" : "http";
const brokerURL = `${protocol}:${API_URL.MAIN_URL}${API_URL.CHAT}`;

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.retryInterval = 5000; // Initial retry interval (in milliseconds)
    this.maxRetryInterval = 60000; // Maximum retry interval (1 minute)
    this.subscriptions = {};
  }

  // Establish WebSocket connection
  async connect(userId, onMessageReceived) {
    const storedToken = await getTokenAsync();

    if (!storedToken) {
      // console.error("No auth token found!");
      return;
    }

    if (this.stompClient && this.stompClient.connected) {
      // console.log("WebSocket client already connected.");
      return;
    }

    // Initialize STOMP Client
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(brokerURL),
      connectHeaders: {
        Authorization: `Bearer ${storedToken}`,
      },
      debug: (str) => {
        // console.log(str);
      },
      onConnect: () => {
        console.log("WebSocket Connected");
        this.subscribeToPrivateMessages(userId, onMessageReceived);
        // Reset retry interval upon successful connection
        this.retryInterval = 5000;
      },
      onStompError: (frame) => {
        // console.error("STOMP error", frame);
        this.retryConnection(userId, onMessageReceived);
      },
      onWebSocketClose: (event) => {
        // console.error("WebSocket closed", event);
        this.retryConnection(userId, onMessageReceived);
      },
    });

    // Activate WebSocket connection
    this.stompClient.activate();
  }

  // Subscribe to private messages for a specific user
  subscribeToPrivateMessages(userId, onMessageReceived) {
    const subscriptionPath = `/user/${userId}/topic/messages`;

    if (this.subscriptions[userId]) {
      // console.log(`Already subscribed to private messages for user ${userId}`);
      return;
    }

    // console.log(`Subscribing to: ${subscriptionPath}`);
    this.subscriptions[userId] = this.stompClient.subscribe(
      subscriptionPath,
      (message) => {
        const newMessage = JSON.parse(message.body);
        onMessageReceived(newMessage);
        // console.log("Received private message:", newMessage);
      }
    );
  }

  // Retry connection using exponential backoff
  retryConnection(userId, onMessageReceived) {
    // console.log(`Attempting to reconnect in ${this.retryInterval}ms...`);
    setTimeout(() => {
      this.connect(userId, onMessageReceived);
      // Increase retry interval (doubling it) up to max limit
      this.retryInterval = Math.min(
        this.retryInterval * 2,
        this.maxRetryInterval
      );
    }, this.retryInterval);
  }

  // Disconnect the WebSocket client
  disconnect() {
    if (this.stompClient) {
      // console.log("Disconnecting WebSocket...");
      this.stompClient.deactivate();
      this.stompClient = null;
      this.subscriptions = {};
    } else {
      // console.log("WebSocket client is not connected.");
    }
  }

  // Send a message to a specific receiver
  sendMessage(msg, receiverId, userId, chatToken) {
    if (this.stompClient && this.stompClient.connected && msg.trim()) {
      const messagePayload = {
        senderId: userId,
        receiverId: receiverId,
        chatToken: chatToken,
        content: msg.trim(),
      };

      this.stompClient.publish({
        destination: `/app/sendMessage`, // Backend destination for sending messages
        body: JSON.stringify(messagePayload),
        headers: {},
      });
    } else {
      // console.log("WebSocket client not connected or message is empty.");
    }
  }

  // Fetch chat history between two users
  async fetchMessageHistory(senderId, receiverId) {
    try {
      const storedToken = await getTokenAsync();
      const response = await fetch(
        `${API_URL.MAIN_URL}${API_URL.MESSAGES}/${senderId}/${receiverId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching message history: ${response.statusText}`
        );
      }

      const messages = await response.json();
      return messages;
    } catch (error) {
      // console.error("Failed to fetch message history", error);
      return [];
    }
  }
}

export const webSocketService = new WebSocketService();

export async function getMessagesForReceiver(receiverId, isFetched) {
  try {
    const storedToken = await getTokenAsync();
    // Ensure the formatDate function and DateFormat are properly imported and available
    const now = new Date();
    const getStartTime = new Date(now.getTime() - 10 * 60 * 60 * 1000);
    const getEndTime = new Date(now.getTime() + 10 * 60 * 60 * 1000);

    const formattedStartDate = formatDate(
      isFetched ? now : getStartTime,
      DateFormat.YYYY_MM_DD_HH_MM_SS
    );
    const formattedEndDate = formatDate(
      getEndTime,
      DateFormat.YYYY_MM_DD_HH_MM_SS
    );

    const url = `${API_URL.MAIN_URL}${API_URL.MESSAGES}${API_URL.RECEIVER}/${receiverId}`;

    const response = await axios.get(url, {
      params: { startDate: formattedStartDate, endDate: formattedEndDate },
      headers: {
        Authorization: `Bearer ${storedToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Failed to fetch messages. Status code:", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error fetching message history:", error);
    return [];
  }
}

export const combineMessagesBySender = (messages, students) => {
  // Create a map to store the combined messages by senderId
  const combinedMessages = {};

  // Loop through each message to group them by senderId
  messages.forEach((message) => {
    const { senderId, content, timestamp } = message;

    // If senderId is already in the map, append the message to the Messages array
    if (combinedMessages[senderId]) {
      combinedMessages[senderId].Messages.push(content);

      // Update the latest date (most recent timestamp) for the senderId
      const currentLatestDate = new Date(combinedMessages[senderId].latestDate);
      const messageDate = new Date(timestamp);
      if (messageDate > currentLatestDate) {
        combinedMessages[senderId].latestDate = timestamp;
      }
    } else {
      // Initialize a new entry for a senderId
      combinedMessages[senderId] = {
        senderId,
        Messages: [content],
        latestDate: timestamp,
      };
    }
  });

  // Now combine with student data by comparing senderId with student.id
  students.forEach((student) => {
    const { id, Messages = [], latestDate, ...studentDetails } = student; // Use student.id

    // Compare senderId with student id
    if (combinedMessages[id]) {
      combinedMessages[id].Messages = [
        ...combinedMessages[id].Messages,
        ...(Array.isArray(Messages) ? Messages : []), // Ensure Messages is an array
      ];

      // Update the latest date if the student's latestDate is more recent
      const currentLatestDate = new Date(combinedMessages[id].latestDate);
      const studentLatestDate = latestDate ? new Date(latestDate) : null;
      if (studentLatestDate && studentLatestDate > currentLatestDate) {
        combinedMessages[id].latestDate = latestDate;
      }

      // Add student details to the combined object
      combinedMessages[id] = {
        ...combinedMessages[id],
        ...studentDetails, // Include all other student details
        id, // Keep the student id
      };
    } else {
      // If no matching senderId in combinedMessages, add the student's data along with their messages
      combinedMessages[id] = {
        senderId: id, // Map student.id to senderId
        Messages: Array.isArray(Messages) ? [...Messages] : [], // Ensure Messages is an array
        latestDate,
        ...studentDetails, // Include all other student details
        id, // Keep the student id
      };
    }
  });

  // Convert the combinedMessages object to an array and return it
  return Object.values(combinedMessages);
};

export const removeMessagesBySenderId = (messages, senderIdToRemove) => {
  return messages.filter((message) => message.senderId !== senderIdToRemove);
};
