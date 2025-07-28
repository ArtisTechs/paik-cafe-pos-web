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
import logo from "../../../assets/img/mindful-mentor-logo.png";

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
          <h1 className="menu-app-title">Mindful Mentor</h1>
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
            {isAppAdmin && (
              <>
                <li>
                  <Button
                    className={`dashbaord-menu-item ${isActive(
                      `${ROUTES.WEB}${ROUTES.CHATS}`
                    )}`}
                    onClick={() =>
                      handleNavigation(`${ROUTES.WEB}${ROUTES.CHATS}`)
                    }
                  >
                    <i className="fas fa-comment"></i>
                    Chats
                  </Button>
                </li>
                <li>
                  <Button
                    className={`dashbaord-menu-item ${isActive(
                      `${ROUTES.WEB}${ROUTES.STUDENTS}`
                    )}`}
                    onClick={() =>
                      handleNavigation(`${ROUTES.WEB}${ROUTES.STUDENTS}`)
                    }
                  >
                    <i className="fas fa-graduation-cap"></i>
                    Students
                  </Button>
                </li>
              </>
            )}
            <li>
              <Button
                className={`dashbaord-menu-item ${isActive(
                  `${ROUTES.WEB}${ROUTES.CALENDAR}`
                )}`}
                onClick={() =>
                  handleNavigation(`${ROUTES.WEB}${ROUTES.CALENDAR}`)
                }
              >
                <i className="far fa-calendar"></i>
                Calendar
              </Button>
            </li>

            <li>
              <Button
                className={`dashbaord-menu-item ${isActive(
                  `${ROUTES.WEB}${ROUTES.APPOINTMENTS}`
                )}`}
                onClick={() =>
                  handleNavigation(`${ROUTES.WEB}${ROUTES.APPOINTMENTS}`)
                }
              >
                <i className="far fa-calendar-check"></i>
                Appointment
              </Button>
            </li>
            {isAppAdmin && (
              <>
                <li>
                  <Button
                    className={`dashbaord-menu-item ${isActive(
                      `${ROUTES.WEB}${ROUTES.ACCOUNT_REQUEST}`
                    )}`}
                    onClick={() =>
                      handleNavigation(`${ROUTES.WEB}${ROUTES.ACCOUNT_REQUEST}`)
                    }
                  >
                    <i className="fas fa-user-plus"></i>
                    Account Request
                  </Button>
                </li>
              </>
            )}
            {!isAppAdmin && (
              <>
                <li>
                  <Button
                    className={`dashbaord-menu-item ${isActive(
                      `${ROUTES.WEB}${ROUTES.JOURNAL}`
                    )}`}
                    onClick={() =>
                      handleNavigation(`${ROUTES.WEB}${ROUTES.JOURNAL}`)
                    }
                  >
                    <i className="fas fa-book"></i>
                    Journal
                  </Button>
                </li>
              </>
            )}
          </ul>
        </OffcanvasBody>
      </Offcanvas>
    </>
  );
};

export default OffCanvasDashboardMenu;
