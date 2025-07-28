import React, { useEffect, useState } from "react";
import "./home-page.css";
import EmotionPicker from "../../components/emotion-picker/emotion-picker.component";
import UpcomingEvents from "../../components/upcoming-events/upcoming-events.component";
import StudentList from "../../components/listing/student-list/student-list";
import {
  AppointmentStatusEnum,
  EErrorMessages,
  fetchAppointmentList,
  getStudentsWithMoodToday,
  toastService,
  useGlobalContext,
} from "../../shared";
import BarGraphEmotion from "../../components/bar-graph-emotion/bar-graph-emotion";

const HomePage = ({ setFullLoadingHandler }) => {
  const { currentUserDetails, isAppAdmin } = useGlobalContext();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [studentLoading, setStudentLoading] = useState(true);

  useEffect(() => {
    if (currentUserDetails.id) {
      loadAppointments();
    }
    if (isAppAdmin) {
      loadStudentsWithMoodToday(); // Fetch students' mood data if user is an admin
    }
  }, [currentUserDetails.id, isAppAdmin]);

  const loadAppointments = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const finalEndDate = tomorrow.toISOString().split("T")[0];

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userId = isAppAdmin ? null : currentUserDetails.id;

      const response = await fetchAppointmentList({
        userId: userId,
        sortBy: "scheduledDate",
        sortDirection: "DSC",
        startDate: today,
        endDate: isAppAdmin ? finalEndDate : null,
        status: isAppAdmin ? AppointmentStatusEnum.APPROVED : null,
      });

      setAppointments(response.content);
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsWithMoodToday = async () => {
    setStudentLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await getStudentsWithMoodToday({
        sortBy: "lastName",
        ignorePagination: true,
      });
      setStudents(response);
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setStudentLoading(false);
    }
  };

  return (
    <div className="home-page">
      {!isAppAdmin && (
        <div className="emotion-picker-container">
          <EmotionPicker />
        </div>
      )}

      <div className="home-page-cards">
        {isAppAdmin && (
          <>
            <BarGraphEmotion students={students} />
            <StudentList
              students={students}
              size="half"
              loading={studentLoading}
              hideDelete={true}
              showEmotionFilter={true}
            />
          </>
        )}

        <UpcomingEvents
          appointments={appointments}
          isAppAdmin={isAppAdmin}
          setFullLoadingHandler={setFullLoadingHandler}
        />
      </div>
    </div>
  );
};

export default HomePage;
