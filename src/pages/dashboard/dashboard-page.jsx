import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./dashboard-page.css";
import Navbar from "../../components/navbar/navbar.component";
import OffCanvasDashboardMenu from "../../components/offcanvas/off-canvas-dashboard-menu/off-canvas-dashboard-menu";
import {
  ROUTES,
  useGlobalContext,
} from "../../shared";
import { Route, Routes } from "react-router-dom";
import HomePage from "../home-page/home-page";
import ItemTypePage from "../item-type-list-page/item-type-page";
import ItemListPage from "../item-list-page/item-list-page";
import BranchQrPage from "../qr-page/qr-page";

const DashboardPage = ({ onLogout, setFullLoadingHandler }) => {
  const {
    currentUserDetails,
  } = useGlobalContext();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [showOffCanvas, setShowOffCanvas] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const routeTitles = {
      [`${ROUTES.WEB}${ROUTES.DASHBOARD}`]: "Dashboard",
      [`${ROUTES.WEB}${ROUTES.ITEM_TYPE}`]: "Category",
      [`${ROUTES.WEB}${ROUTES.ITEMS}`]: "Menu Items",
      [`${ROUTES.WEB}${ROUTES.QR_PAGE}`]: "Scan QR Code",
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
          <Route
            path={ROUTES.ITEMS}
            element={
              <ItemListPage setFullLoadingHandler={setFullLoadingHandler} />
            }
          />
          <Route
            path={ROUTES.QR_PAGE}
            element={
              <BranchQrPage setFullLoadingHandler={setFullLoadingHandler} />
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
