import React, { useRef } from "react";
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
  const backdropRef = useRef();

  React.useEffect(() => {
    // Reset error when dialog opens or closes
    if (!open) setNameError && setNameError("");
  }, [open, setNameError]);

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
      className={`form-backdrop${open ? " open" : ""}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`form-drawer${open ? " open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="form-header">
          <h3>{editingType ? "Edit" : "Add"} Category</h3>
        </div>

        <form className="form-body" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="form-label">Name</label>
            <input
              className="form-input"
              name="name"
              placeholder="Enter category name"
              value={form.name}
              onChange={handleInputChange}
              autoFocus
            />
            {nameError && <div className="form-error">{nameError}</div>}
          </div>
          <div>
            <label className="form-label mt-3">Description</label>
            <input
              className="form-input"
              name="description"
              placeholder="Enter category description"
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
