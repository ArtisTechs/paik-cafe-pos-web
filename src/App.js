import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/_variables.css";
import "./styles/_globalStyles.css";
import LoginPage from "./pages/login/login-page";
import ToastMessage from "./components/toast-message/toast-message";
import {
  STORAGE_KEY,
  toastService,
  modalService,
  ROUTES,
  EErrorMessages,
  getUserDetails,
} from "./shared";
import FullLoaderComponent from "./components/full-loader/full-loader-component";
import DashboardPage from "./pages/dashboard/dashboard-page";
import { useGlobalContext } from "./shared/context";
import ConfirmationModal from "./components/confirmation-modal-component/confirmation-modal.component";

function App() {
  // State for managing toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // State for loading screen
  const [isLoading, setIsLoading] = useState(true);

  // State for logged-in status
  const [loggedIn, setLoggedIn] = useState(false);

  // Get user details and admin status from context
  const {
    setCurrentUserDetails,
    setIsMessagesFetch,
  } = useGlobalContext();

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    confirmText: "",
    confirmButtonClass: "",
    onConfirm: null,
    onCancel: null,
  });

  // Effect to check login status and load user details
  useEffect(() => {
    const profileID = localStorage.getItem(STORAGE_KEY.PROFILE_ID);

    if (profileID) {
      setLoggedIn(true);

      const fetchUserDetails = async () => {
        try {
          const storedProfile = await getUserDetails(profileID);
          setCurrentUserDetails(storedProfile);
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
          handleLogout();
        }
      };

      fetchUserDetails();

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
      handleLogout();
    }
  }, [setCurrentUserDetails]);

  // Effect to register the global toast service
  useEffect(() => {
    toastService.registerShowToastCallback((message, variant) => {
      setToastMessage(message);
      setToastVariant(variant);
      setShowToast(true);
    });
  }, []);

  // Effect to register the global modal service
  useEffect(() => {
    modalService.registerShowModalCallback(
      ({
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        confirmButtonClass,
      }) => {
        setModalData({
          title,
          message,
          onConfirm,
          onCancel,
          confirmText,
          confirmButtonClass,
        });
        setShowConfirmModal(true);
      }
    );

    modalService.registerHideModalCallback(() => {
      setShowConfirmModal(false);
    });
  }, []);

  // Handle successful login and store profile details
  const handleLoginSuccess = (profileData) => {
    localStorage.setItem(STORAGE_KEY.PROFILE_ID, profileData.id);
    localStorage.setItem(STORAGE_KEY.BRANCH_ID, profileData.branchId);
    setCurrentUserDetails(profileData);
    setLoggedIn(true);
  };

  // Handle logout, clearing localStorage and resetting state
  const handleLogout = () => {
    localStorage.clear();
    setCurrentUserDetails(null);
    setLoggedIn(false);
    setIsMessagesFetch(false);
  };

  // Confirm modal actions
  const handleConfirm = () => {
    if (modalData.onConfirm) modalData.onConfirm();
    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    if (modalData.onCancel) modalData.onCancel();
    setShowConfirmModal(false);
  };

  return (
    <Router>
      {isLoading && <FullLoaderComponent isLoading={isLoading} />}

      <div className="app">
        <header className="app-header"></header>
        <div className="app-body">
          <Routes>
            {/* Login Route */}
            <Route
              path={ROUTES.LOGIN}
              element={
                loggedIn ? (
                  <Navigate to={`${ROUTES.WEB}${ROUTES.DASHBOARD}`} />
                ) : (
                  <LoginPage
                    setFullLoadingHandler={setIsLoading}
                    onLoginSuccess={handleLoginSuccess}
                  />
                )
              }
            />

            {/* Protected Dashboard Route */}
            <Route
              path={`${ROUTES.WEB}/*`}
              element={
                loggedIn ? (
                  <DashboardPage
                    setFullLoadingHandler={setIsLoading}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to={ROUTES.LOGIN} />
                )
              }
            />

            {/* Redirect Root to Login or Dashboard */}
            <Route
              path="/"
              element={
                loggedIn ? (
                  <Navigate to={`${ROUTES.WEB}${ROUTES.DASHBOARD}`} />
                ) : (
                  <Navigate to={ROUTES.LOGIN} />
                )
              }
            />

            {/* Catch-all route redirects to login */}
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} />} />
          </Routes>
        </div>
        <footer className="app-footer"></footer>

        {/* Toast Notifications */}
        <ToastMessage
          show={showToast}
          setShow={setShowToast}
          message={toastMessage}
          variant={toastVariant}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          show={showConfirmModal}
          title={modalData.title}
          message={modalData.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          confirmText={modalData.confirmText}
          confirmButtonClass={modalData.confirmButtonClass}
        />
      </div>
    </Router>
  );
}

export default App;
