import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import "./profile-page.css";
import { Avatar } from "@mui/material";
import {
  validateEmail,
  validateStudentNumber,
  validatePhoneNumber,
  EErrorMessages,
  stringAvatar,
  getUserDetails,
  toastService,
  saveUserProfile,
  removeEmptyFields,
  ESuccessMessages,
  modalService,
  uploadProfilePicture,
  validatePassword,
} from "../../shared";
import { useGlobalContext } from "../../shared/context";

const ProfilePage = ({ setFullLoadingHandler }) => {
  const location = useLocation();
  const { student, isViewSelf } = location.state || {};
  const { currentUserDetails, isAppAdmin, setCurrentUserDetails } =
    useGlobalContext();

  const [profile, setProfile] = useState(() => {
    return student || currentUserDetails;
  });

  const [tempProfilePicture, setTempProfilePicture] = useState(null);
  const [originalProfilePicture] = useState(profile.profilePicture);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [errors, setErrors] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    studentNumber: "",
    phoneNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setFullLoadingHandler(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const userId = student ? student.id : currentUserDetails.id;
        const userDetails = await getUserDetails(userId);
        setProfile(userDetails);
        setFormData(userDetails);
      } catch (error) {
        toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
      } finally {
        setFullLoadingHandler(false);
      }
    };

    fetchUserDetails();
  }, [student, currentUserDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    let formIsValid = true;
    let newErrors = {};

    if (!isViewSelf) {
      if (!formData.firstName) {
        newErrors.firstName = EErrorMessages.FIRST_NAME_REQUIRED;
        formIsValid = false;
      }
      if (!formData.lastName) {
        newErrors.lastName = EErrorMessages.LAST_NAME_REQUIRED;
        formIsValid = false;
      }
      if (!formData.email) {
        newErrors.email = EErrorMessages.EMAIL_REQUIRED;
        formIsValid = false;
      }
      if (!formData.studentNumber) {
        newErrors.studentNumber = EErrorMessages.STUDENT_NUMBER_REQUIRED;
        formIsValid = false;
      } else if (!validateStudentNumber(formData.studentNumber)) {
        newErrors.studentNumber = EErrorMessages.STUDENT_NUMBER_INVALID;
        formIsValid = false;
      }
    } else {
      if (!formData.firstName) {
        newErrors.firstName = EErrorMessages.FIRST_NAME_REQUIRED;
        formIsValid = false;
      }
      if (!formData.lastName) {
        newErrors.lastName = EErrorMessages.LAST_NAME_REQUIRED;
        formIsValid = false;
      }
      if (!formData.email) {
        newErrors.email = EErrorMessages.EMAIL_REQUIRED;
        formIsValid = false;
      } else if (!validateEmail(formData.email)) {
        newErrors.email = EErrorMessages.EMAIL_INVALID;
        formIsValid = false;
      }
      if (!formData.studentNumber && !isAppAdmin) {
        newErrors.studentNumber = EErrorMessages.STUDENT_NUMBER_REQUIRED;
        formIsValid = false;
      } else if (
        !validateStudentNumber(formData.studentNumber) &&
        !isAppAdmin
      ) {
        newErrors.studentNumber = EErrorMessages.STUDENT_NUMBER_INVALID;
        formIsValid = false;
      }
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = EErrorMessages.PHONE_NUMBER_REQUIRED;
        formIsValid = false;
      } else if (!validatePhoneNumber(formData.phoneNumber)) {
        newErrors.phoneNumber = EErrorMessages.PHONE_NUMBER_INVALID;
        formIsValid = false;
      }
    }
    if (formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
        formIsValid = false;
      }
    }

    setErrors(newErrors);

    if (!formIsValid) {
      setFullLoadingHandler(false);
      return;
    }

    const filteredFormData = removeEmptyFields(formData);

    modalService.show({
      title: "Update Profile?",
      message: `Are you sure you want to update profile details?`,
      onConfirm: async () => {
        setFullLoadingHandler(true);
        setTimeout(async () => {
          try {
            await saveUserProfile(profile.id, filteredFormData);
            setProfile((prev) => ({
              ...prev,
              ...filteredFormData,
            }));
            setIsEditing(false);
            setFullLoadingHandler(false);

            if (currentUserDetails.id === filteredFormData.id) {
              setCurrentUserDetails(filteredFormData);
            }

            toastService.show(ESuccessMessages.UPDATE_PROFILE, "success-toast");
          } catch (error) {
            toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
            setFullLoadingHandler(false);
          }
        }, 500);
      },
      onCancel: () => {
        // Optionally handle cancel action
      },
    });
  };

  const handleEditClick = () => {
    if (isEditing) {
      setFormData(profile);

      setErrors({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        studentNumber: "",
        phoneNumber: "",
        password: "",
      });
    }
    setIsEditing(!isEditing);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const fileURL = URL.createObjectURL(file);
      setTempProfilePicture(fileURL);

      try {
        setFullLoadingHandler(true);
        const uploadedImageUrl = await uploadProfilePicture(file);
        await new Promise((resolve) => setTimeout(resolve, 500));

        setFormData((prev) => ({
          ...prev,
          profilePicture: uploadedImageUrl,
        }));
      } catch (error) {
        // console.error("Error uploading the profile picture:", error);
      } finally {
        setFullLoadingHandler(false);
      }
    } else {
      toastService.show(EErrorMessages.PICTURE_UPLOAD_FAILED, "danger-toast");
    }
  };

  const handleClearProfileClick = () => {
    if (isEditing) {
      setTempProfilePicture(null);
      setFormData((prev) => ({
        ...prev,
        profilePicture: null,
      }));
    }
  };

  const renderError = (field) => {
    return isEditing && errors[field] ? (
      <div className="text-danger error-input-text">{errors[field]}</div>
    ) : null;
  };

  return (
    <div className="profile-page">
      <div className="profile-container shadow">
        <div className="profile-header">
          <div className="profile-avatar">
            <Avatar
              {...stringAvatar(
                `${profile.firstName}`,
                `${profile.lastName}`,
                150,
                42
              )}
              src={
                isEditing
                  ? tempProfilePicture || formData.profilePicture
                  : profile.profilePicture
              }
            />
            {isEditing && (
              <>
                <div className="change-profile-icon">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="avatar-upload-label"
                  >
                    <i className="fas fa-file-image"></i>
                  </label>
                </div>
                {formData.profilePicture &&
                  formData.profilePicture !== "undefined" && (
                    <div className="clear-profile-icon">
                      <button onClick={handleClearProfileClick}>
                        <i className="fas fa-circle-xmark"></i>
                      </button>
                    </div>
                  )}
              </>
            )}
          </div>
          <button className="edit-profile-button" onClick={handleEditClick}>
            {isEditing ? (
              <i className="fas fa-arrow-left"></i>
            ) : (
              <i className="fas fa-edit"></i>
            )}
          </button>
        </div>

        {isEditing ? (
          <div className="profile-details-edit">
            <form onSubmit={handleFormSubmit} className="profile-edit-form">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control primary-input text-capitalize"
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  maxLength={64}
                />
                <label htmlFor="firstName">
                  First Name<span className="text-danger">*</span>
                </label>
                {renderError("firstName")}
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control primary-input text-capitalize"
                  id="middleName"
                  name="middleName"
                  placeholder="Middle Name"
                  value={formData.middleName || ""}
                  onChange={handleInputChange}
                  maxLength={64}
                />
                <label htmlFor="middleName">Middle Name</label>
                {renderError("middleName")}
              </div>

              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control primary-input text-capitalize"
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  maxLength={64}
                />
                <label htmlFor="lastName">
                  Last Name<span className="text-danger">*</span>
                </label>
                {renderError("lastName")}
              </div>

              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control primary-input"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email || ""}
                  disabled={isAppAdmin && !isViewSelf}
                  onChange={handleInputChange}
                  maxLength={64}
                />
                <label htmlFor="email">
                  Email<span className="text-danger">*</span>
                </label>
                {renderError("email")}
              </div>

              {((isAppAdmin && student) || (!isAppAdmin && isViewSelf)) && (
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control primary-input"
                    id="studentNumber"
                    name="studentNumber"
                    placeholder="Student Number"
                    value={formData.studentNumber || ""}
                    onChange={handleInputChange}
                    maxLength={64}
                  />
                  <label htmlFor="studentNumber">
                    Student Number<span className="text-danger">*</span>
                  </label>
                  {renderError("studentNumber")}
                </div>
              )}

              <div className="form-floating mb-3">
                <input
                  type="tel"
                  className="form-control primary-input"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber || ""}
                  onChange={handleInputChange}
                  maxLength={64}
                />
                <label htmlFor="phoneNumber">Phone Number</label>
                {renderError("phoneNumber")}
              </div>

              {isViewSelf ||
                (isAppAdmin && (
                  <>
                    <div className="form-floating mb-3 position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control primary-input"
                        id="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password || ""}
                        onChange={handleInputChange}
                        maxLength={64}
                      />
                      <label htmlFor="password">Password</label>
                      <button
                        type="button"
                        className="btn position-absolute end-0 top-0 mt-2 me-2"
                        onClick={togglePasswordVisibility}
                      >
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                      {renderError("password")}
                    </div>
                  </>
                ))}

              <div className="button-container">
                <button
                  className="secondary-button shadow"
                  onClick={handleEditClick}
                >
                  Cancel
                </button>
                <button type="submit" className="white-button shadow">
                  Save
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-details">
            <h1 className="text-label text-capitalize">Name</h1>
            <p className="text-value text-capitalize">
              {`${profile.firstName} ${
                profile.middleName ? profile.middleName + " " : ""
              }${profile.lastName}` || "N/A"}
            </p>
            <h1 className="text-label">Email</h1>
            <p className="text-value">{profile.email || "N/A"}</p>
            {((isAppAdmin && student) || (!isAppAdmin && isViewSelf)) && (
              <>
                <h1 className="text-label">Student Number</h1>
                <p className="text-value">{profile.studentNumber || "N/A"}</p>
              </>
            )}
            <h1 className="text-label">Phone Number</h1>
            <p className="text-value">{profile.phoneNumber || "N/A"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
