import React, { useEffect, useRef, useState } from "react";
import "./student-list.css";
import { Avatar, Skeleton } from "@mui/material";
import {
  AccountStatusEnum,
  changeUserStatus,
  EErrorMessages,
  emotionCode,
  ROUTES,
  stringAvatar,
  toastService,
  modalService,
  deleteUser,
  getEmotionImage,
} from "../../../shared";
import { useNavigate } from "react-router-dom";

const StudentList = ({
  students,
  loading,
  size = "full",
  showHeader = true,
  hideOptions,
  hideEmotion,
  hideDelete,
  isGetLatestStudent,
  isItemClickable,
  onSelectStudent,
  isSelectedStudent,
  isRequest = false,
  refetch,
  showEmotionFilter = false,
}) => {
  const [selectedStudent, setSelectedStudent] = useState(
    isSelectedStudent || null
  );
  const hasInitialized = useRef(false);
  const navigate = useNavigate();
  const [filteredEmotion, setFilteredEmotion] = useState(null);

  useEffect(() => {
    if (
      isGetLatestStudent &&
      onSelectStudent &&
      students.length > 0 &&
      !hasInitialized.current
    ) {
      if (!selectedStudent) {
        onSelectStudent(students[0]);
        setSelectedStudent(students[0]);
      } else {
        onSelectStudent(selectedStudent);
      }

      hasInitialized.current = true;
    }
  }, [isGetLatestStudent, onSelectStudent, students]);

   const handleFilterClick = (code) => {
     setFilteredEmotion((prev) => (prev === code ? null : code)); // Toggle filter
   };

  const filteredStudents = filteredEmotion
    ? students.filter((student) => student.moodCode === filteredEmotion)
    : students;

  const handleItemClick = (student) => {
    if (isItemClickable && onSelectStudent) {
      setSelectedStudent(student);
      onSelectStudent(student);
    }
  };

  const handleNavigation = (route, student, isViewSelf) => {
    navigate(route, { state: { student, isViewSelf } });
  };

  const handleApproveClick = (studentDetails) => {
    modalService.show({
      title: "Approve Student?",
      message: `Are you sure you want to approve ${studentDetails.firstName} ${studentDetails.lastName}'s account?`,
      onConfirm: async () => {
        try {
          const status = AccountStatusEnum.ACTIVE;
          const response = await changeUserStatus(studentDetails.id, status);
          toastService.show(
            `${studentDetails.firstName} ${studentDetails.lastName} successfully approved.`,
            "success-toast"
          );
          refetch();
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        }
      },
      onCancel: () => {
        // console.log("Approval cancelled");
      },
    });
  };

  const handleRejectClick = (studentDetails) => {
    modalService.show({
      title: "Reject Student?",
      message: `Are you sure you want to reject ${studentDetails.firstName} ${studentDetails.lastName}'s account? 
      The account will also be deleted.`,
      onConfirm: async () => {
        try {
          const response = await deleteUser(studentDetails.id);
          toastService.show(
            `${studentDetails.firstName} ${studentDetails.lastName} has been rejected.`,
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

  const handleDeleteClick = (studentDetails) => {
    modalService.show({
      title: "Delete Student",
      message: `Are you sure you want to Delete ${studentDetails.firstName} ${studentDetails.lastName}'s account?`,
      onConfirm: async () => {
        try {
          const response = await deleteUser(studentDetails.id);
          toastService.show(
            `${studentDetails.firstName} ${studentDetails.lastName} has been deleted.`,
            "danger-toast"
          );
          refetch();
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        }
      },
      confirmText: "Delete",
      confirmButtonClass: "danger-button",
    });
  };

  return (
    <div className={`student-list-container shadow student-list-${size}`}>
      {showHeader && (
        <>
          <h1>Students</h1>
          <div className="student-list-divider"></div>
        </>
      )}

      {showEmotionFilter && ( // Show filter dynamically
        <div className="emotion-filter-icons">
          {Object.values(emotionCode).map((emotion) => (
            <div
              key={emotion.code}
              className={`emotion-icon ${
                filteredEmotion === emotion.code ? "selected-emotion" : ""
              }`}
              onClick={() => handleFilterClick(emotion.code)}
              style={{
                cursor: "pointer",
                padding: "8px",
                borderRadius: "50%",
                backgroundColor:
                  filteredEmotion === emotion.code ? "#e0f7fa" : "transparent",
              }}
            >
              <img
                src={getEmotionImage(emotion.code)}
                alt={emotion.displayName}
                title={emotion.displayName}
                className="emotion-filter-icons-img"
                style={{
                  filter:
                    filteredEmotion === emotion.code
                      ? "none"
                      : "grayscale(100%)",
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="student-list">
        {loading ? (
          <>
            {[...Array(5)].map((_, index) => (
              <div
                key={index} // Add key here
                className={`student-card-loader student-card-${size}`}
              >
                <Skeleton
                  key={`circular-${index}`}
                  variant="circular"
                  width={42}
                  height={42}
                />
                <div className="student-card-loader-label">
                  <Skeleton
                    key={`text-1-${index}`}
                    variant="text"
                    width="50%"
                    height={32}
                  />
                  <Skeleton
                    key={`text-2-${index}`}
                    variant="text"
                    width="30%"
                    height={20}
                  />
                </div>
              </div>
            ))}
          </>
        ) : filteredStudents && filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`student-card student-card-${size} ${
                selectedStudent?.id === student.id ? "selected-student" : ""
              } ${isRequest ? "request-card" : null}`}
              onClick={() => handleItemClick(student)}
              style={{ cursor: isItemClickable ? "pointer" : "default" }}
            >
              <div className="student-info">
                <Avatar
                  {...stringAvatar(
                    `${student.firstName}`,
                    `${student.lastName}`,
                    size === "full" ? 42 : size === "half" ? 32 : 24,
                    size === "full" ? 20 : size === "half" ? 16 : 12
                  )}
                  src={student.profilePicture}
                />
                <div className={`student-labels-${size}`}>
                  <span className={`student-name ms-3 student-name-${size}`}>
                    {student.lastName}, {student.firstName}
                  </span>
                  {student.email && size === "full" && (
                    <span className="student-list-subtitle ms-3">
                      {student.email}
                    </span>
                  )}
                  {student.studentNumber && size === "full" && (
                    <span className="student-list-subtitle ms-3">
                      {student.studentNumber}
                    </span>
                  )}
                </div>
                {student?.Messages?.length > 0 && (
                  <div className="student-message-count">
                    {student?.Messages?.length}
                  </div>
                )}
              </div>

              {!hideOptions && !isRequest && (
                <div className={`dropdown student-dropdown-${size}`}>
                  <button
                    className="ellipsis-btn"
                    type="button"
                    id={`dropdownMenuButton${student.id}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby={`dropdownMenuButton${student.id}`}
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          handleNavigation(
                            `${ROUTES.WEB}${ROUTES.CALENDAR}`,
                            student
                          )
                        }
                      >
                        Calendar
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          handleNavigation(
                            `${ROUTES.WEB}${ROUTES.CHATS}`,
                            student
                          )
                        }
                      >
                        Chat
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          handleNavigation(
                            `${ROUTES.WEB}${ROUTES.PROFILE}`,
                            student,
                            false
                          )
                        }
                      >
                        Profile
                      </button>
                    </li>
                    {!hideDelete && (
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleDeleteClick(student)}
                        >
                          Delete
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {!hideEmotion && student.moodCode && !isRequest && (
                <img
                  src={getEmotionImage(student.moodCode)}
                  alt={student.moodCode}
                  className={`emotion-icon emotion-icon-${size}`}
                />
              )}

              {isRequest && (
                <div className="button-container">
                  <button
                    className="danger-button student-list-button"
                    onClick={() => handleRejectClick(student)}
                  >
                    Reject
                  </button>
                  <button
                    className="primary-button student-list-button"
                    onClick={() => handleApproveClick(student)}
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            <p>No students to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
