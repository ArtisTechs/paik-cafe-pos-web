import React from "react";
import {
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Button,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./off-canvas-dashboard-menu.css";
import { ROUTES } from "../../../shared";
import logo from "../../../assets/img/paik-logo.png";

const OffCanvasDashboardMenu = ({ show, handleClose }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  const handleNavigation = (path) => {
    handleClose();
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path ? "dashbaord-menu-item-active" : "";
  };

  return (
    <>
      <Offcanvas
        className="dashboard-menu"
        show={show}
        onHide={handleClose}
        placement="start"
      >
        <OffcanvasHeader className="offcanvas-menu-header">
          <img src={logo} alt="logo" className="menu-logo" />
          <h1 className="menu-app-title">Paik's Coffee</h1>
          <button className="arrow-close-btn" onClick={handleClose}>
            <i className="bi bi-arrow-left"></i>
          </button>
        </OffcanvasHeader>
        <OffcanvasBody className="d-flex justify-content-center">
          <ul className="list-unstyled">
            <li>
              <Button
                className={`dashbaord-menu-item ${isActive(
                  `${ROUTES.WEB}${ROUTES.DASHBOARD}`
                )}`}
                onClick={() =>
                  handleNavigation(`${ROUTES.WEB}${ROUTES.DASHBOARD}`)
                }
              >
                <i className="fas fa-table-columns"></i>
                Dashboard
              </Button>
            </li>
            <li>
              <Button
                className={`dashbaord-menu-item ${isActive(
                  `${ROUTES.WEB}${ROUTES.ITEM_TYPE}`
                )}`}
                onClick={() =>
                  handleNavigation(`${ROUTES.WEB}${ROUTES.ITEM_TYPE}`)
                }
              >
                <i className="fa-solid fa-tags"></i>
                Category
              </Button>
            </li>
            <li>
              <Button
                className={`dashbaord-menu-item ${isActive(
                  `${ROUTES.WEB}${ROUTES.ITEMS}`
                )}`}
                onClick={() => handleNavigation(`${ROUTES.WEB}${ROUTES.ITEMS}`)}
              >
                <i className="fa-solid fa-boxes-packing"></i>
                Menu Items
              </Button>
            </li>
            <li>
              <Button
                className={`dashbaord-menu-item ${isActive(
                  `${ROUTES.WEB}${ROUTES.QR_PAGE}`
                )}`}
                onClick={() =>
                  handleNavigation(`${ROUTES.WEB}${ROUTES.QR_PAGE}`)
                }
              >
                <i className="fa-solid fa-qrcode"></i>
                Scan QR Code
              </Button>
            </li>
          </ul>
        </OffcanvasBody>
      </Offcanvas>
    </>
  );
};

export default OffCanvasDashboardMenu;
