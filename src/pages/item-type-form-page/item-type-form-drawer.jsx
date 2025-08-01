import React, { useEffect, useRef, useState } from "react";
import "./item-type-form-drawer.css";

const ItemTypeFormDrawer = ({
  open,
  form,
  setForm,
  editingType,
  onClose,
  onSubmit,
  nameError,
  setNameError,
}) => {
  const [visible, setVisible] = useState(open);
  const backdropRef = useRef();

  useEffect(() => {
    if (open) setVisible(true);
    else {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    // Reset error when dialog opens or closes
    if (!open) setNameError && setNameError("");
  }, [open, setNameError]);

  if (!open && !visible) return null;

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose && onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "name" && setNameError) setNameError(""); // Reset name error when typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || form.name.trim() === "") {
      setNameError && setNameError("Name is required.");
      return;
    }
    onSubmit && onSubmit();
  };

  return (
    <div
      ref={backdropRef}
      className={`item-type-form-drawer-backdrop${open ? " open" : ""}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`item-type-form-drawer${open ? " open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="form-header">
          <h3>{editingType ? "Edit" : "Add"} Item Type</h3>
        </div>

        <form className="form-body" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="form-label">Name</label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              required
              autoFocus
            />
            {nameError && <div className="form-error">{nameError}</div>}
          </div>
          <div>
            <label className="form-label mt-3">Description</label>
            <input
              className="form-input"
              name="description"
              value={form.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-footer">
            <button
              type="button"
              onClick={onClose}
              className="secondary-button"
              style={{ marginLeft: "0.5rem" }}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {editingType ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemTypeFormDrawer;
