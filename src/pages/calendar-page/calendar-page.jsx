import React, { useEffect, useState, useCallback } from "react";
import "./calendar-page.css";
import CalendarComponent from "../../components/calendar/calendar.component";
import { useGlobalContext } from "../../shared/context";
import StudentList from "../../components/listing/student-list/student-list";
import {
  AccountStatusEnum,
  EErrorMessages,
  fetchStudentList,
  formatDate,
  getMoods,
  toastService,
} from "../../shared";
import { DateFormat } from "../../shared/enum/date-format.enum";
import { useLocation } from "react-router-dom";

const CalendarPage = ({ setFullLoadingHandler }) => {
  const location = useLocation();
  const { student } = location.state || {};
  const { currentUserDetails, isAppAdmin } = useGlobalContext();
  const [moodsData, setMoodsData] = useState([]);
  const [students, setStudents] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(() => {
    return student || null;
  });

  // Fetch moods whenever the date range or current user changes
  useEffect(() => {
    if (currentUserDetails?.id && dateRange?.startDate && dateRange?.endDate) {
      const fetchMoods = async () => {
        try {
          setFullLoadingHandler(true);
          await new Promise((resolve) => setTimeout(resolve, 500));

          const filters = {
            userId: selectedStudent
              ? selectedStudent.id
              : currentUserDetails?.id,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          };

          const data = await getMoods(filters);
          setMoodsData(data);
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        } finally {
          setFullLoadingHandler(false);
        }
      };

      fetchMoods();
    }
  }, [dateRange, currentUserDetails, selectedStudent]);

  useEffect(() => {
    if (isAppAdmin) {
      loadStudents();
    }
  }, [isAppAdmin]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetchStudentList({
        status: AccountStatusEnum.ACTIVE,
        ignorePagination: true,
      });
      setStudents(response.content);
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setLoading(false);
    }
  };

  // Memoize the onDateRangeChange function to avoid unnecessary re-renders
  const onDateRangeChange = useCallback(
    (startDate, endDate) => {
      const adjustedStartDate = new Date(startDate);
      const adjustedEndDate = new Date(endDate);

      // Subtract 1 day from startDate
      adjustedStartDate.setDate(adjustedStartDate.getDate() - 1);
      // Add 1 day to endDate
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

      // Format the adjusted dates
      const formattedStartDate = formatDate(
        adjustedStartDate,
        DateFormat.YYYY_MM_DD
      );
      const formattedEndDate = formatDate(
        adjustedEndDate,
        DateFormat.YYYY_MM_DD
      );

      // Only update the date range if it's different from the current one
      if (
        formattedStartDate !== dateRange?.startDate ||
        formattedEndDate !== dateRange?.endDate
      ) {
        setDateRange({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });
      }
    },
    [dateRange]
  ); // Only change when dateRange itself changes

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
  };

  return (
    <div className="calendar-page">
      {isAppAdmin && (
        <div className="student-list-calendar">
          <StudentList
            students={students}
            size="half"
            hideEmotion={true}
            hideOptions={true}
            isItemClickable={true}
            isGetLatestStudent={true}
            loading={loading}
            onSelectStudent={handleSelectStudent}
            isSelectedStudent={selectedStudent}
          />
        </div>
      )}

      <div className="calendar-component-page">
        <CalendarComponent
          onDateRangeChange={onDateRangeChange}
          data={moodsData}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
