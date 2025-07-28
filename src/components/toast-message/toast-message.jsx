import React, { useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import "./toast-message.css";

const ToastMessage = ({
  show,
  setShow,
  message,
  variant = "success-toast",
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, setShow]);

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast
        onClose={() => setShow(false)}
        show={show}
        delay={5000}
        autohide
        className={variant}
      >
        <Toast.Body className="toast-message">
          <p>{message}</p>
          <button
            type="button"
            className="btn-close toast-btn"
            onClick={() => setShow(false)}
            aria-label="Close"
          />
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastMessage;
