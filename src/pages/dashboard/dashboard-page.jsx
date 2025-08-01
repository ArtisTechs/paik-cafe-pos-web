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
import ItemTypePage from "../item-type-page/item-type-page";

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
      [`${ROUTES.WEB}${ROUTES.ITEM_TYPE}`]: "Category",
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
            path={ROUTES.ITEM_TYPE}
            element={
              <ItemTypePage setFullLoadingHandler={setFullLoadingHandler} />
            }
          />
        </Routes>
      </div>

      <OffCanvasDashboardMenu
        show={showOffCanvas}
        handleClose={handleToggleOffCanvas}
      />
    </div>
  );
};

export default DashboardPage;
