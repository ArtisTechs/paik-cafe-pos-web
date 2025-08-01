import React from "react";
import {
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Button,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./off-canvas-dashboard-menu.css";
import { ROUTES, useGlobalContext } from "../../../shared";
import logo from "../../../assets/img/paik-logo.png";

const OffCanvasDashboardMenu = ({ show, handleClose }) => {
  const { currentUserDetails, isAppAdmin } = useGlobalContext();
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
          </ul>
        </OffcanvasBody>
      </Offcanvas>
    </>
  );
};

export default OffCanvasDashboardMenu;
