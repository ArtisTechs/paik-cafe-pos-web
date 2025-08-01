import React, { useEffect, useRef, useState } from "react";
import "./item-form-drawer.css";
import { uploadProfilePicture } from "../../shared";

const ItemFormDrawer = ({
  open,
  form,
  setForm,
  editingItem,
  onClose,
  onSubmit,
  nameError,
  setNameError,
  itemTypes = [],
}) => {
  const backdropRef = useRef();
  const [formErrors, setFormErrors] = useState({});
  const [tempPhoto, setTempPhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setTempPhoto(
        form.photo || (editingItem ? editingItem.photo : null) || null
      );
    } else {
      setTempPhoto(null);
    }
  }, [open, editingItem]);

  React.useEffect(() => {
    if (!open) setNameError && setNameError("");
  }, [open, setNameError]);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose && onClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedValue = value;
    if (type === "checkbox") updatedValue = checked;
    setForm((prev) => ({ ...prev, [name]: updatedValue }));

    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleVariationChange = (e) => {
    const value = e.target.value;
    const variations = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");
    const lowercased = variations.map((v) => v.toLowerCase());
    const hasDuplicate = new Set(lowercased).size !== lowercased.length;

    setForm((prev) => ({
      ...prev,
      variation: variations,
      variationInput: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      variation: hasDuplicate ? "Duplicate variations are not allowed." : "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!form.name || form.name.trim() === "") {
      errors.name = "Name is required.";
    }
    if (!form.itemTypeId) {
      errors.itemTypeId = "Item type is required.";
    }
    if (!form.price || isNaN(form.price)) {
      errors.price = "Price is required.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      onSubmit && onSubmit();
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return;
    }
    setTempPhoto(URL.createObjectURL(file));
    setPhotoUploading(true);

    try {
      const url = await uploadProfilePicture(file);
      setForm((prev) => ({ ...prev, photo: url }));
    } catch (error) {
      setForm((prev) => ({ ...prev, photo: "" }));
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setTempPhoto(null);
    setForm((prev) => ({ ...prev, photo: "" }));
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
          <h3>{editingItem ? "Edit" : "Add"} Item</h3>
        </div>

        <form className="form-body" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="form-label">
              Name <span className="text-danger">*</span>
            </label>
            <input
              className="form-input text-capitalize"
              name="name"
              value={form?.name || ""}
              onChange={handleInputChange}
              placeholder="Enter item name"
              autoFocus
            />
            {(formErrors.name || nameError) && (
              <div className="form-error">{formErrors.name || nameError}</div>
            )}
          </div>

          <div>
            <label className="form-label mt-3">Description</label>
            <input
              className="form-input"
              name="description"
              value={form?.description || ""}
              onChange={handleInputChange}
              placeholder="Enter item description"
            />
          </div>

          <div>
            <label className="form-label mt-3">
              Category <span className="text-danger">*</span>
            </label>
            <select
              className="form-input"
              name="itemTypeId"
              value={form?.itemTypeId || ""}
              onChange={handleInputChange}
            >
              <option value="">Select category</option>
              {itemTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {formErrors.itemTypeId && (
              <div className="form-error">
                {formErrors.itemTypeId || nameError}
              </div>
            )}
          </div>

          <div>
            <label className="form-label mt-3">Variation</label>
            <input
              className="form-input text-capitalize"
              name="variationInput"
              placeholder="e.g. Regular, Large, Extra Large"
              value={
                form?.variationInput ||
                (form?.variation ? form?.variation.join(", ") : "")
              }
              onChange={handleVariationChange}
            />
            <small className="form-helper">Separate with comma</small>
            {formErrors.variation && (
              <div className="form-error">{formErrors.variation}</div>
            )}
          </div>

          <div>
            <label className="form-label mt-3">
              Price (₱) <span className="text-danger">*</span>
            </label>
            <input
              className="form-input"
              type="number"
              name="price"
              step="0.01"
              min="0"
              value={form?.price || ""}
              onChange={handleInputChange}
              placeholder="Enter item price"
            />
            {formErrors.price && (
              <div className="form-error">{formErrors.price}</div>
            )}
          </div>

          <div>
            <label className="form-label mt-3">Photo</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {tempPhoto || form.photo ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={tempPhoto || form.photo}
                    alt="Item"
                    className="item-photo-preview"
                    style={{ opacity: photoUploading ? 0.5 : 1 }}
                  />
                  {photoUploading && (
                    <div className="item-photo-uploading-overlay">
                      Uploading...
                    </div>
                  )}
                  <button
                    type="button"
                    className="item-photo-remove-btn"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="item-photo-upload"
                  className="item-photo-upload-area"
                  title="Upload photo"
                >
                  <i
                    className="fas fa-image"
                    style={{ fontSize: 24, color: "#bbb" }}
                  />
                </label>
              )}
              <input
                id="item-photo-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
                disabled={photoUploading}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label d-flex align-items-center gap-1">
              <input
                className="form-checkbox"
                type="checkbox"
                name="inStock"
                checked={form?.inStock ?? true}
                onChange={handleInputChange}
              />{" "}
              In Stock
            </label>
          </div>
        </form>
        <div className="form-footer">
          <button
            type="button"
            onClick={onClose}
            className="secondary-button"
            style={{ marginLeft: "0.5rem" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            onClick={handleSubmit}
          >
            {editingItem ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemFormDrawer;
