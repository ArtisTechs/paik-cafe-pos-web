import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import "./appointment-page.css";
import { Avatar } from "@mui/material";
import {
  EErrorMessages,
  ESuccessMessages,
  fetchAppointmentList,
  STORAGE_KEY,
  stringAvatar,
  toastService,
  createAppointment,
  fetchCounselorList,
  AccountStatusEnum,
} from "../../shared";
import DatePicker from "../../components/date-picker/date-picker.component";
import { useGlobalContext } from "../../shared/context";
import AppointmentCardList from "../../components/listing/appointment-list/appointment-list";

const AppointmentPage = ({ setFullLoadingHandler }) => {
  const { currentUserDetails, isAppAdmin } = useGlobalContext();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [counselorDetails, setCounselorDetails] = useState("");

  useEffect(() => {
    if (isAppAdmin) {
      loadAppointments();
    } else {
      fetchCounselorDetails();
    }
  }, [currentUserDetails.id]);

  const fetchCounselorDetails = async () => {
    setFullLoadingHandler(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetchCounselorList({
        status: AccountStatusEnum.ACTIVE,
      });
      setCounselorDetails(response.content[0]);
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setFullLoadingHandler(false);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetchAppointmentList({
        sortBy: "scheduledDate",
        sortDirection: "DSC",
        startDate: today,
      });

      setAppointments(response.content);
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleReasonChange = (event) => {
    setReason(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFullLoadingHandler(true);

    if (!selectedDate) {
      setFullLoadingHandler(false);
      toastService.show(EErrorMessages.DATE_REQUIRED, "danger-toast");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const appointmentDTO = {
        userId: currentUserDetails.id,
        scheduledDate: selectedDate,
        reason: reason,
      };

      const createdAppointment = await createAppointment(appointmentDTO);

      if (createdAppointment) {
        toastService.show(ESuccessMessages.APPOINTMENT, "success-toast");

        // Reset the form after successful submission
        setSelectedDate("");
        setReason("");
      }
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setFullLoadingHandler(false);
    }
  };

  const refetch = () => {
    loadAppointments();
  };

  return (
    <div className="appointment-page">
      {!isAppAdmin && (
        <>
          <div className="appointment-container shadow">
            <div className="counselor-info">
              <Avatar
                {...stringAvatar(
                  `${counselorDetails.firstName}`,
                  `${counselorDetails.lastName}`,
                  100,
                  32
                )}
                src={counselorDetails.profilePicture}
              />
              <div className="counselor-details">
                <h3 className="mb-0">{`${counselorDetails.firstName} ${counselorDetails.lastName}`}</h3>
                <p className="mb-0">Counselor</p>
                {/* <p className="available-schedule mb-0">
                  Available Schedule:{" "}
                  <strong>{counselor.availableSchedule}</strong>
                </p> */}
              </div>
            </div>

            <Form onSubmit={handleSubmit} className="appointment-form">
              <DatePicker
                selectedDate={selectedDate}
                handleDateChange={handleDateChange}
                minDate={new Date().toISOString().split("T")[0]} // today's date
              />

              <Form.Group className="reason-input">
                <Form.Label>
                  <strong>Reason:</strong>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter reason for appointment"
                  value={reason}
                  onChange={handleReasonChange}
                  required
                  maxLength={255}
                />
              </Form.Group>

              <div className="button-container mb-2">
                <button className="white-button shadow" type="submit">
                  Save Schedule
                </button>
              </div>
            </Form>
          </div>
        </>
      )}
      {isAppAdmin && (
        <>
          <AppointmentCardList
            appointments={appointments}
            isLoading={loading}
            refetch={refetch}
          />
        </>
      )}
    </div>
  );
};

export default AppointmentPage;
