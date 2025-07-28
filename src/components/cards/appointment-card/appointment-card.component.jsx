import React from "react";
import "./appointment-card.component.css";
import { Avatar } from "@mui/material";
import {
  AppointmentStatusEnum,
  capitalizeText,
  formatDate,
  stringAvatar,
} from "../../../shared";
import { DateFormat } from "../../../shared/enum/date-format.enum";

const AppointmentCard = ({
  title,
  student,
  date,
  status,
  reason,
  onApprove,
  onReject,
}) => {
  return (
    <div className="appointment-card">
      <div className="card-header">
        <h2>{`${title} Counseling Session` || "Request"}</h2>
        <div className="appointment-card-divider"></div>
      </div>
      <div className="card-body">
        <div className="user-info">
          <Avatar
            {...stringAvatar(
              `${student.firstName}`,
              `${student.lastName}`,
              80,
              32
            )}
            src={student.profilePicture} // Corrected to use profilePicture
          />
        </div>
        <div className="appointment-card-labels">
          <div className="user-details">
            <h3>{`${student.lastName}, ${student.firstName}`}</h3>
            <p>{capitalizeText(student.role)}</p>
          </div>
          <div className="appointment-date">
            <h3>Date</h3>
            <p>{formatDate(date, DateFormat.MONTH_DAY_YEAR)}</p>
          </div>
          {reason && (
            <div className="appointment-reason">
              <h3>Reason</h3>
              <p>{reason}</p>
            </div>
          )}
        </div>
      </div>

      {status !== AppointmentStatusEnum.APPROVED && (
        <div className="button-container">
          <button className="danger-button" onClick={onReject}>
            Reject
          </button>
          <button className="primary-button" onClick={onApprove}>
            Approve
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
