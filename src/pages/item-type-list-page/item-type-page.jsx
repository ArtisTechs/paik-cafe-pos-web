import React, { useState, useEffect } from "react";
import "./item-type-page.css";
import {
  EErrorMessages,
  fetchItemTypes,
  toastService,
  modalService,
  deleteItemType,
  editItemType,
  addItemType,
  capitalizeText,
} from "../../shared";
import ItemTypeFormDrawer from "../item-type-form-page/item-type-form-drawer";

const ItemTypePage = ({ setFullLoadingHandler }) => {
  const [types, setTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const loadTypes = async () => {
      setFullLoadingHandler(true);
      try {
        const data = await fetchItemTypes();
        setTypes(data);
      } catch (error) {
        toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
      } finally {
        setFullLoadingHandler(false);
      }
    };
    loadTypes();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (showForm) {
      if (editingType) {
        setForm({
          name: editingType.name,
          description: editingType.description,
        });
      } else {
        setForm({ name: "", description: "" });
      }
    }
  }, [editingType, showForm]);

  const refetchTypes = async () => {
    setFullLoadingHandler(true);
    try {
      const data = await fetchItemTypes();
      setTypes(data);
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setFullLoadingHandler(false);
    }
  };

  const openAddForm = () => {
    setEditingType(null);
    setShowForm(true);
  };

  const openEditForm = (type) => {
    setEditingType(type);
    setShowForm(true);
    setMenuOpenId(null);
  };

  const handleDelete = (type) => {
    modalService.show({
      title: "Delete Item Type?",
      message: `Are you sure you want to delete "${type.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmButtonClass: "danger-button",
      onConfirm: async () => {
        setFullLoadingHandler(true);
        try {
          await deleteItemType(type.id);
          await refetchTypes();
          toastService.show(
            `Category "${type.name}" deleted successfully.`,
            "success-toast"
          );
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        } finally {
          setFullLoadingHandler(false);
          setMenuOpenId(null);
        }
      },
      onCancel: () => {
        setMenuOpenId(null);
      },
    });
  };

  const handleSubmit = async () => {
    setFullLoadingHandler(true);
    const payload = {
      name: capitalizeText(form.name?.trim()) || "",
      description: form.description?.trim() || "",
    };
    try {
      if (editingType) {
        await editItemType(editingType.id, payload);
        toastService.show("Category updated.", "success-toast");
      } else {
        await addItemType(payload);
        toastService.show("Category added.", "success-toast");
      }
      setShowForm(false);
      await refetchTypes();
    } catch (error) {
      if (
        error?.data?.code === "ITEM_TYPE_EXISTS" ||
        error?.data?.errorCode === "ITEM_TYPE_EXISTS"
      ) {
        setNameError("Category name already exists.");
      } else {
        toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
      }
    } finally {
      setFullLoadingHandler(false);
    }
  };


  return (
    <div className="item-type-page">
      <button className="primary-button" onClick={openAddForm}>
        <i className="fa-solid fa-plus"></i> Add
      </button>

      <div className="item-type-list">
        {types.length === 0 && <div>No item types found.</div>}
        {types.map((type) => (
          <div key={type.id} className="item-type-row">
            <div>
              <div className="type-name text-capitalize">{type.name}</div>
              <div className="type-description text-capitalize">
                {type.description}
              </div>
            </div>
            <div className="kebab-menu-container">
              <button
                className="kebab-btn"
                onClick={() =>
                  setMenuOpenId(menuOpenId === type.id ? null : type.id)
                }
              >
                <span>⋮</span>
              </button>
              {menuOpenId === type.id && (
                <div className="kebab-dropdown">
                  <button onClick={() => openEditForm(type)}>Edit</button>
                  <button
                    onClick={() => handleDelete(type)}
                    className="text-danger"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ItemTypeFormDrawer
        open={showForm}
        form={form}
        setForm={setForm}
        editingType={editingType}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        nameError={nameError}
        setNameError={setNameError}
      />
    </div>
  );
};

export default ItemTypePage;
