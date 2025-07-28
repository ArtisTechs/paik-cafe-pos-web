import React from "react";
import "./appointment-list.css";
import AppointmentCard from "../../cards/appointment-card/appointment-card.component";
import { Skeleton } from "@mui/material";
import {
  capitalizeText,
  changeAppointmentStatus,
  deleteAppointment,
  EErrorMessages,
  formatDate,
  modalService,
  toastService,
} from "../../../shared";
import { DateFormat } from "../../../shared/enum/date-format.enum";

const AppointmentCardList = ({ appointments, isLoading, refetch }) => {
  const handleApprove = (appointment) => {
    const student = appointment.user;
    modalService.show({
      title: "Approved Requested Schedule?",
      message: `Are you sure you want to approve ${student.firstName} ${
        student.lastName
      }'s Requested Schedule 
      on ${formatDate(appointment.scheduledDate, DateFormat.MONTH_DAY_YEAR)}?`,
      onConfirm: async () => {
        try {
          const statusUpdateDTO = { status: "APPROVED" };
          const response = await changeAppointmentStatus(
            appointment.id,
            statusUpdateDTO
          );
          toastService.show(
            `${student.firstName} ${student.lastName}'s Requested Schedule successfully approved.`,
            "success-toast"
          );
          refetch();
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        }
      },
      onCancel: () => {
        // Optionally handle cancel action
      },
    });
  };

  const handleReject = (appointment) => {
    const student = appointment.user;
    modalService.show({
      title: "Approved Requested Schedule?",
      message: `Are you sure you want to reject ${student.firstName} ${
        student.lastName
      }'s Requested Schedule 
      on ${formatDate(
        appointment.scheduledDate,
        DateFormat.MONTH_DAY_YEAR
      )}? This will also be deleted.`,
      onConfirm: async () => {
        try {
          const response = await deleteAppointment(appointment.id);
          toastService.show(
            `${student.firstName} ${student.lastName}'s Requested Schedule successfully rejected.`,
            "success-toast"
          );
          refetch();
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        }
      },
      confirmText: "Reject",
      confirmButtonClass: "danger-button",
    });
  };

  // Skeleton loader element
  const renderSkeletonLoader = () => (
    <div className="skeleton-container-appointment">
      <Skeleton variant="rectangular" width="100%" height={100} />
      <Skeleton variant="text" width="60%" height={30} />
      <Skeleton variant="text" width="40%" height={20} />
      <div className="button-container mt-2">
        <Skeleton variant="text" width="45%" height={40} />
        <Skeleton variant="text" width="45%" height={40} />
      </div>
    </div>
  );

  return (
    <div className="appointment-list shadow">
      {isLoading ? (
        // Display skeleton loader while loading
        <div>
          {renderSkeletonLoader()}
          {renderSkeletonLoader()}
          {renderSkeletonLoader()}
          {renderSkeletonLoader()}
        </div>
      ) : !appointments || appointments.length === 0 ? (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
          <p>No appointments available.</p>
        </div>
      ) : (
        appointments.map((appointment, index) => {
          const student = appointment.user;
          const isValidAppointment =
            appointment &&
            student &&
            student.firstName &&
            student.lastName &&
            appointment.scheduledDate;

          return isValidAppointment ? (
            <AppointmentCard
              key={index}
              title={`${capitalizeText(appointment.status)}`}
              student={student}
              date={appointment.scheduledDate || "Date not available"}
              status={appointment.status}
              reason={appointment.reason}
              onApprove={() => handleApprove(appointment)}
              onReject={() => handleReject(appointment)}
            />
          ) : (
            <p key={index}>
              Invalid appointment data for appointment ID: {appointment.id}
            </p>
          );
        })
      )}
    </div>
  );
};

export default AppointmentCardList;
