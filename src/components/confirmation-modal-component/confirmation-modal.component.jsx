import React from "react";
import { Modal } from "react-bootstrap";

const ConfirmationModal = ({
  title,
  show,
  message,
  status,
  onConfirm,
  onCancel,
  confirmText = "Proceed",
  confirmButtonClass = "primary-button",
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || "Confirm Action"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer className="justify-content-center">
        <div className="button-container">
          <button
            className="secondary-button student-list-button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`${confirmButtonClass} student-list-button`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
