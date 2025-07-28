import React, { useEffect, useState } from "react";
import "./upcoming-events.component.css";
import {
  deleteAppointment,
  EErrorMessages,
  formatDate,
  modalService,
  ROUTES,
  toastService,
} from "../../shared";
import { useNavigate } from "react-router-dom";
import { DateFormat } from "../../shared/enum/date-format.enum";

const UpcomingEventsCard = ({ event, onDelete }) => {
  const { title, date, description, studentName, isAppAdmin } = event;

  const handleDelete = () => {
    onDelete(event);
  };

  return (
    <div className="event-card shadow">
      <div className="event-card-header d-flex justify-content-between align-items-center">
        <div>
          <h1>{title}</h1>
          <p>{formatDate(date, DateFormat.MONTH_DAY_YEAR)}</p>
        </div>
        <div className="dropdown">
          <button
            className="ellipsis-btn"
            type="button"
            id={`dropdownMenuButton${title}`}
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fas fa-ellipsis-v"></i>
          </button>
          <ul
            className="dropdown-menu"
            aria-labelledby={`dropdownMenuButton${title}`}
          >
            <li>
              <button className="dropdown-item" onClick={handleDelete}>
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="event-card-body">
        {description && (
          <p className="event-description">
            <b>Reason:</b> {description}
          </p>
        )}
        {isAppAdmin && (
          <p>
            <b>Student: </b> {studentName}
          </p>
        )}
      </div>
    </div>
  );
};

const UpcomingEvents = ({
  appointments,
  isAppAdmin,
  setFullLoadingHandler,
}) => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const formattedEvents = appointments.map((appointment) => ({
        id: appointment.id,
        title: "Counseling Appointment",
        date: appointment.scheduledDate,
        description: appointment.reason,
        studentName: `${appointment.user.firstName} ${appointment.user.lastName}`,
        isAppAdmin: isAppAdmin,
      }));
      setEvents(formattedEvents);
    }
  }, [appointments, isAppAdmin]);

  const handleDeleteEvent = (eventToDelete) => {
    modalService.show({
      title: "Delete Appointment?",
      message: `Are you sure you want to delete the appointment for ${
        isAppAdmin
          ? eventToDelete.studentName
          : formatDate(eventToDelete.date, DateFormat.MONTH_DAY_YEAR)
      }?`,
      onConfirm: async () => {
        try {
          setFullLoadingHandler(true);
          await new Promise((resolve) => setTimeout(resolve, 500));

          await deleteAppointment(eventToDelete.id);
          const updatedEvents = events.filter(
            (event) => event.id !== eventToDelete.id
          );

          setEvents(updatedEvents);
          setFullLoadingHandler(false);
          toastService.show(
            `Appointment for ${formatDate(
              eventToDelete.date,
              DateFormat.MONTH_DAY_YEAR
            )} has been deleted.`,
            "success-toast"
          );
        } catch (error) {
          setFullLoadingHandler(false);
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        }
      },
      confirmText: "Delete",
      confirmButtonClass: "danger-button",
    });
  };

  const handleScheduleClick = () => {
    navigate(`${ROUTES.WEB}${ROUTES.APPOINTMENTS}`);
  };

  return (
    <div className="upcoming-events-container shadow">
      <h1>
        {events && events.length > 0
          ? "Upcoming Appointments"
          : "No upcoming appointments"}
      </h1>
      <div className="events-divider"></div>
      <div className="upcoming-events-list">
        {events && events.length > 0 ? (
          events.map((event, index) => (
            <UpcomingEventsCard
              key={index}
              event={event}
              onDelete={handleDeleteEvent} // Pass the delete handler
            />
          ))
        ) : (
          <div className="no-events-message">
            {!isAppAdmin ? (
              <>
                <p>
                  Schedule a personal appointment with a guidance counselor?
                </p>
                <button className="schedule-btn" onClick={handleScheduleClick}>
                  Schedule Now <i className="bi bi-arrow-right"></i>
                </button>
              </>
            ) : (
              <p>You don't have any upcoming counseling schedule today.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
