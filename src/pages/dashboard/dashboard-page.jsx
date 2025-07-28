import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./dashboard-page.css";
import Navbar from "../../components/navbar/navbar.component";
import OffCanvasDashboardMenu from "../../components/offcanvas/off-canvas-dashboard-menu/off-canvas-dashboard-menu";
import {
  EErrorMessages,
  getMessagesForReceiver,
  ROUTES,
  toastService,
  useGlobalContext,
} from "../../shared";
import { Route, Routes } from "react-router-dom";
import HomePage from "../home-page/home-page";
import ProfilePage from "../profile-page/profile-page";
import CalendarPage from "../calendar-page/calendar-page";
import AppointmentPage from "../appointment-page/appointment-page";
import ChatWindow from "../../components/chat-window/chat-window.component";
import StudentListPage from "../student-list-page/student-list-page";
import ChatPage from "../chat-page/chat-page";
import AccountRequestPage from "../account-request-page/account-request-page";
import JournalPage from "../journal-page/journal-page";

const DashboardPage = ({ onLogout, setFullLoadingHandler }) => {
  const {
    currentUserDetails,
    isAppAdmin,
    isMessagesFetch,
    setIsMessagesFetch,
    adminMessages,
    setAdminMessages,
  } = useGlobalContext();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [showOffCanvas, setShowOffCanvas] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch messages initially when user details and admin status change
    if (currentUserDetails?.id && isAppAdmin) {
      loadNewMessages();
    }

    // Set up the interval to fetch messages every 5 seconds
    const intervalId = setInterval(() => {
      if (currentUserDetails?.id && isAppAdmin) {
        loadNewMessages();
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [currentUserDetails?.id, isAppAdmin]);

  const loadNewMessages = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const recentMessages = await getMessagesForReceiver(
        currentUserDetails.id,
        isMessagesFetch
      );

      if (!isMessagesFetch) {
        setIsMessagesFetch(true);
      }

      const uniqueNewMessages = recentMessages.filter(
        (newMsg) => !adminMessages.some((msg) => msg.id === newMsg.id)
      );

      setAdminMessages((prevMessages) => {
        const combinedMessages = [...prevMessages, ...uniqueNewMessages];

        const uniqueMessagesById = Array.from(
          new Set(combinedMessages.map((msg) => msg.id))
        ).map((id) => combinedMessages.find((msg) => msg.id === id));

        return uniqueMessagesById;
      });
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    }
  };

  useEffect(() => {
    const routeTitles = {
      [`${ROUTES.WEB}${ROUTES.DASHBOARD}`]: "Dashboard",
      [`${ROUTES.WEB}${ROUTES.PROFILE}`]: "Profile",
      [`${ROUTES.WEB}${ROUTES.CALENDAR}`]: "Calendar",
      [`${ROUTES.WEB}${ROUTES.APPOINTMENTS}`]: "Appointments",
      [`${ROUTES.WEB}${ROUTES.STUDENTS}`]: "Students",
      [`${ROUTES.WEB}${ROUTES.CHATS}`]: "Chats",
      [`${ROUTES.WEB}${ROUTES.ACCOUNT_REQUEST}`]: "Account Request",
      [`${ROUTES.WEB}${ROUTES.JOURNAL}`]: "My Journal",
    };

    setPageTitle(routeTitles[location.pathname] || "Dashboard");
  }, [location.pathname]);

  const handleToggleOffCanvas = () => {
    setShowOffCanvas(!showOffCanvas);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <Navbar
          title={pageTitle}
          toggleOffCanvas={handleToggleOffCanvas}
          onLogout={onLogout}
          profile={currentUserDetails}
        />
      </div>
      <div className="dashboard-content">
        <Routes>
          <Route
            path={ROUTES.DASHBOARD}
            element={<HomePage setFullLoadingHandler={setFullLoadingHandler} />}
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProfilePage setFullLoadingHandler={setFullLoadingHandler} />
            }
          />
          <Route
            path={ROUTES.CALENDAR}
            element={
              <CalendarPage setFullLoadingHandler={setFullLoadingHandler} />
            }
          />
          <Route
            path={ROUTES.APPOINTMENTS}
            element={
              <AppointmentPage setFullLoadingHandler={setFullLoadingHandler} />
            }
          />

          {isAppAdmin && (
            <>
              <Route path={ROUTES.STUDENTS} element={<StudentListPage />} />
              <Route
                path={ROUTES.CHATS}
                element={
                  <ChatPage setFullLoadingHandler={setFullLoadingHandler} />
                }
              />
              <Route
                path={ROUTES.ACCOUNT_REQUEST}
                element={<AccountRequestPage />}
              />
            </>
          )}
          {!isAppAdmin && (
            <>
              <Route
                path={ROUTES.JOURNAL}
                element={
                  <JournalPage setFullLoadingHandler={setFullLoadingHandler} />
                }
              />
            </>
          )}
        </Routes>
      </div>

      {!isAppAdmin && (
        <ChatWindow setFullLoadingHandler={setFullLoadingHandler} />
      )}

      {location.pathname !== `${ROUTES.WEB}${ROUTES.DASHBOARD}` && (
        <button
          className="home-button-dashboard gradient-background"
          onClick={() => navigate(`${ROUTES.WEB}${ROUTES.DASHBOARD}`)}
        >
          <i className="fas fa-home"></i>
        </button>
      )}

      {isAppAdmin &&
        location.pathname === `${ROUTES.WEB}${ROUTES.DASHBOARD}` && (
          <button
            className="chat-head gradient-background shadow"
            onClick={() => navigate(`${ROUTES.WEB}${ROUTES.CHATS}`)}
          >
            {adminMessages.length > 0 && (
              <div className="messages-count">{adminMessages.length}</div>
            )}
            <i className="far fa-message"></i>
          </button>
        )}

      <OffCanvasDashboardMenu
        show={showOffCanvas}
        handleClose={handleToggleOffCanvas}
      />
    </div>
  );
};

export default DashboardPage;
