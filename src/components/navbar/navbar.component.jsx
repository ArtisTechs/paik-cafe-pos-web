import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import "./navbar.component.css";
import { Avatar } from "@mui/material";
import logo from "../../assets/img/mindful-mentor-logo.png";
import { ROUTES, stringAvatar } from "../../shared";

const Navbar = ({ title, toggleOffCanvas, onLogout, profile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleProfileClick = () => {
    navigate(`${ROUTES.WEB}${ROUTES.PROFILE}`, {
      state: { isViewSelf: true },
    });
  };

  return (
    <nav className="navbar gradient-background shadow-black">
      <div className="navbar-app-logo-title">
        <h1>Mindful Mentor</h1>
      </div>
      <div className="navbar-left">
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleOffCanvas}
        >
          <i className="bi bi-list"></i>
        </button>
      </div>
      <div className="navbar-center">
        <h1 className="navbar-title text-capitalize">
          {title || "Page Title"}
        </h1>
      </div>
      <div className="navbar-right">
        <div className="btn-group">
          <button
            type="button"
            className="btn profile-btn"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <Avatar
              {...stringAvatar(
                `${profile.firstName}`,
                `${profile.lastName}`,
                35,
                16
              )}
              alt={`${profile.firstName} ${profile.lastName}`}
              src={profile.profilePicture}
            />
          </button>

          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                className="dropdown-item"
                onClick={handleProfileClick} // Use button to handle navigation
              >
                Profile
              </button>
            </li>
            <li>
              <div className="dropdown-divider"></div>
            </li>
            <li>
              <a className="dropdown-item" onClick={handleLogout}>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
