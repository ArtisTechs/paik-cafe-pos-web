import React, { useState, useEffect, useRef } from "react";
import { Popover, OverlayTrigger } from "react-bootstrap";
import "./chat-window.component.css";
import {
  AccountStatusEnum,
  arrangeMessagesByTimestamp,
  EErrorMessages,
  fetchCounselorList,
  STORAGE_KEY,
  stringAvatar,
  toastService,
  useGlobalContext,
  webSocketService,
} from "../../shared";
import { Avatar } from "@mui/material";

const ChatWindow = ({ setFullLoadingHandler }) => {
  const { currentUserDetails } = useGlobalContext(); // Destructure currentUserDetails from context
  const [messages, setMessages] = useState([]); // Start with an empty message array
  const [inputValue, setInputValue] = useState("");
  const [newMessageCount, setNewMessageCount] = useState(0);
  const chatBodyRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counselorDetails, setCounselorDetails] = useState(null);

  // Fetch counselor details when the current user changes
  useEffect(() => {
    fetchCounselorDetails();
  }, [currentUserDetails]);

  const fetchCounselorDetails = async () => {
    setFullLoadingHandler(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetchCounselorList({
        status: AccountStatusEnum.ACTIVE,
      });

      // Set the first counselor's details; ensure there's at least one
      if (response.content && response.content.length > 0) {
        setCounselorDetails(response.content[0]);
      }
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setFullLoadingHandler(false);
    }
  };

  // Ensure counselorDetails is available before connecting
  useEffect(() => {
    if (counselorDetails) {
      const receiverId = counselorDetails.id;
      const userId = currentUserDetails.id;

      // WebSocket message handler to receive messages
      const handleReceivedMessage = (message) => {
        if (message.senderId === receiverId) {
          setNewMessageCount((prevCount) => prevCount + 1);
        } else {
          setNewMessageCount(0);
        }
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, message];
          return updatedMessages;
        });
      };

      // Connect to WebSocket for receiving messages
      webSocketService.connect(userId, handleReceivedMessage);

      // Fetch message history
      const fetchHistory = async () => {
        setFullLoadingHandler(true);
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const senderHistory = await webSocketService.fetchMessageHistory(
            userId,
            receiverId
          );
          const receiverHistory = await webSocketService.fetchMessageHistory(
            receiverId,
            userId
          );
          const messageHistory = arrangeMessagesByTimestamp(
            senderHistory,
            receiverHistory
          );
          setMessages(messageHistory);
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        } finally {
          setFullLoadingHandler(false);
        }
      };

      fetchHistory();

      // Disconnect WebSocket when the component is unmounted or counselor changes
      return () => {
        webSocketService.disconnect();
      };
    }
  }, [counselorDetails, currentUserDetails]); // Add currentUserDetails dependency

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-scroll when chat window is visible
  useEffect(() => {
    if (isVisible && chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [isVisible]);

  const handleSendMessage = () => {
    const messageText = String(inputValue).trim();

    if (messageText) {
      try {
        webSocketService.sendMessage(
          messageText,
          counselorDetails.id,
          currentUserDetails.id,
          currentUserDetails.id
        );
      } catch (error) {
        toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
      }
      setInputValue("");
    }

    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleToggle = () => setIsVisible(!isVisible);
  const handleClose = () => setIsVisible(false);

  const popover = (
    <Popover id="chat-popover">
      <div className={`chat-window ${isVisible ? "open" : "close"}`}>
        <div className="chat-header">
          <div className="chat-avatar">
            {counselorDetails && (
              <Avatar
                {...stringAvatar(
                  `${counselorDetails?.firstName}`,
                  `${counselorDetails?.lastName}`,
                  40,
                  18
                )}
                src={counselorDetails.profilePicture}
              />
            )}
            {/* <div
              className={`is-active ${
                counselorDetails?.isActive ? "active" : "inactive"
              }`}
            ></div> */}
            <h3>
              {`${counselorDetails?.firstName} ${counselorDetails?.lastName}`}{" "}
              (Counselor)
            </h3>
          </div>

          <button className="close-btn-chat" onClick={handleClose}>
            <i className="fa fa-times"></i>
          </button>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id} // Use message id as key
                className={`chat-bubble ${
                  msg.senderId === currentUserDetails.id ? "user" : "counselor"
                }`}
              >
                {msg.content}
              </div>
            ))
          ) : (
            <p className="mb-0 chat-bubble counselor">
              No messages yet. Feel free to reach out to your counselor — start
              the conversation anytime!
            </p>
          )}
        </div>
        <div className="chat-footer">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            maxLength={255}
          />
          <button className="send-btn" onClick={handleSendMessage}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </Popover>
  );

  return (
    <>
      <OverlayTrigger
        trigger="click"
        placement="auto"
        overlay={popover}
        show={isVisible}
        onToggle={handleToggle}
        rootClose
      >
        <button className="chat-head gradient-background shadow">
          {newMessageCount > 0 && (
            <div className="messages-count">{newMessageCount}</div>
          )}

          <i className="far fa-message"></i>
        </button>
      </OverlayTrigger>
    </>
  );
};

export default ChatWindow;
