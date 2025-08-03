import React, { useEffect, useState } from "react";
import "./item-list-page.css";
import {
  fetchItemList,
  fetchItemTypes,
  addItem, // <-- ADD THIS
  editItem, // <-- ADD THIS
  deleteItem,
  EErrorMessages,
  modalService,
  toastService,
  capitalizeText,
} from "../../shared";
import ItemFormDrawer from "../item-form-page/item-form-drawer";

const ItemListPage = ({ setFullLoadingHandler }) => {
  const blankForm = {
    name: "",
    description: "",
    itemTypeId: "",
    variation: [],
    variationInput: "",
    price: [],
    photo: "",
    inStock: true,
  };

  const [items, setItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [nameError, setNameError] = useState("");

  // Load items and types
  const loadItems = async () => {
    setFullLoadingHandler(true);
    try {
      const data = await fetchItemList();
      setItems(data);
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setFullLoadingHandler(false);
    }
  };

  const loadItemTypes = async () => {
    try {
      const types = await fetchItemTypes();
      setItemTypes(types);
    } catch {
      setItemTypes([]);
    }
  };

  useEffect(() => {
    loadItems();
    loadItemTypes();
    // eslint-disable-next-line
  }, []);

  // Open drawer for add
  const openAddForm = () => {
    setEditingItem(null);
    setForm(blankForm);
    setShowForm(true);
    setNameError("");
  };

  // Open drawer for edit
  const openEditForm = (item) => {
    const editForm = {
      ...item,
      itemTypeId: item.itemType?.id || "",
      variationInput: item.variation ? item.variation.join(", ") : "",
      priceInput: Array.isArray(item.price)
        ? item.price.join(", ")
        : item.price
        ? item.price.toString()
        : "",
    };
    setEditingItem(item);
    setForm(editForm);
    setShowForm(true);
    setNameError("");
  };

  // Close drawer
  const handleClose = () => {
    setShowForm(false);
    setEditingItem(null);
    setNameError("");
    setForm(blankForm);
  };

  const handleSubmit = async () => {
    setFullLoadingHandler(true);
    const payload = {
      name: capitalizeText(form.name?.trim()) || "",
      description: form.description?.trim() || "",
      itemTypeId: form.itemTypeId,
      variation: (form.variation || []).map((v) => capitalizeText(v.trim())),
      price: Array.isArray(form.price) ? form.price : [parseFloat(form.price)],
      photo: form.photo?.trim() || "",
      inStock: !!form.inStock,
    };
    try {
      if (editingItem) {
        await editItem(editingItem.id, payload);
        toastService.show("Item successfully updated.", "success-toast");
      } else {
        await addItem(payload);
        toastService.show("Item successfully added.", "success-toast");
      }
      setShowForm(false);
      setEditingItem(null);
      await loadItems();
    } catch (error) {
      if (
        error?.data?.code === "ITEM_ALREADY_EXISTS" ||
        error?.data?.errorCode === "ITEM_ALREADY_EXISTS"
      ) {
        setNameError("Item name already exists.");
      } else {
        toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
      }
    } finally {
      setFullLoadingHandler(false);
    }
  };

  const handleDeleteItem = (item) => {
    modalService.show({
      title: "Delete Item?",
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      confirmButtonClass: "danger-button",
      onConfirm: async () => {
        setFullLoadingHandler(true);
        try {
          await deleteItem(item.id);
          await loadItems();
          toastService.show(
            `Item "${item.name}" deleted successfully.`,
            "success-toast"
          );
        } catch (error) {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        } finally {
          setFullLoadingHandler(false);
        }
      },
      onCancel: () => {},
    });
  };

  // Render
  return (
    <div className="item-list-page">
      <button className="primary-button" onClick={openAddForm}>
        <i className="fa-solid fa-plus"></i> Add Item
      </button>
      <div className="item-grid-scroll-container">
        <div className="item-grid">
          {items.length === 0 ? (
            <p>No items found.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-card-actions">
                  <button
                    className="edit-btn-item"
                    onClick={() => openEditForm(item)}
                    title="Edit Item"
                  >
                    <i className="fa fa-pencil" />
                  </button>
                  <button
                    className="delete-btn-item"
                    onClick={() => handleDeleteItem(item)}
                    title="Delete Item"
                  >
                    <i className="fa fa-trash" />
                  </button>
                </div>
                <div className="item-photo-wrapper">
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="item-photo"
                      loading="lazy"
                    />
                  ) : (
                    <i className="fa-solid fa-mug-hot item-photo-icon"></i>
                  )}
                </div>
                <div>
                  <span className="badge">{item?.itemType?.name || "—"}</span>
                </div>
                <h3 className="fw-bold m-0">{item?.name}</h3>
                
                <div className="text-muted">{item?.description}</div>

                <div>
                  <span className="fw-bold">Price:</span>
                  {item?.variation &&
                  item.variation.length > 0 &&
                  Array.isArray(item.price) ? (
                    <div style={{ marginLeft: 8 }}>
                      {item.variation.map((v, i) => {
                        const priceVal = item.price[i];
                        return (
                          <div key={v}>
                            <span className="fw-bold">{v}</span>
                            {": "}
                            {priceVal !== undefined &&
                            priceVal !== null &&
                            !isNaN(priceVal) &&
                            priceVal !== "" ? (
                              <>₱{Number(priceVal).toFixed(2)}</>
                            ) : (
                              "-"
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : Array.isArray(item.price) &&
                    item.price.length > 0 &&
                    item.price[0] !== undefined &&
                    item.price[0] !== null &&
                    !isNaN(item.price[0]) &&
                    item.price[0] !== "" ? (
                    <span style={{ marginLeft: 8 }}>
                      ₱{Number(item.price[0]).toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ marginLeft: 8 }}>—</span>
                  )}
                </div>

                <div>
                  <span className="fw-bold">In Stock:</span>{" "}
                  {item?.inStock ? "Yes" : "No"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ItemFormDrawer
        open={showForm}
        form={form}
        setForm={setForm}
        editingItem={editingItem}
        onClose={handleClose}
        onSubmit={handleSubmit}
        nameError={nameError}
        setNameError={setNameError}
        itemTypes={itemTypes}
      />
    </div>
  );
};

export default ItemListPage;
