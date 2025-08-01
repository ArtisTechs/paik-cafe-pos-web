import React, { useState, useEffect, useRef } from "react";
import "./order-form-drawer.css";
import { EErrorMessages, toastService, updateOrder } from "../../shared";

const OrderFormDrawer = ({ open, order, onClose, onSaved }) => {
  const drawerRef = useRef();

  const [form, setForm] = useState({
    totalPrice: order?.totalPrice ?? "",
    cash: order?.cash ?? "",
    changeAmount: order?.changeAmount ?? "",
  });

  useEffect(() => {
    if (open && order) {
      setForm({
        totalPrice: order.totalPrice ?? "",
        cash: order.cash ?? "",
        changeAmount: order.changeAmount ?? "",
      });
    }
    // eslint-disable-next-line
  }, [open, order]);

  const handleBackdropClick = (e) => {
    if (e.target === drawerRef.current) {
      onClose && onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        itemIds: order.itemIds,
        quantity: order.quantity,
        variation: order.variation,
        totalPrice: parseFloat(form.totalPrice),
        cash: parseFloat(form.cash),
        change: parseFloat(form.changeAmount),
        orderStatus: order.orderStatus,
      };
      await updateOrder(order.id, payload);
      onSaved && onSaved();
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    }
  };

  return (
    <div
      ref={drawerRef}
      className={`form-backdrop${open ? " open" : ""}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`form-drawer${open ? " open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="form-header">
          <h3>Edit Order</h3>
        </div>
        <form className="form-body" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Total Price</label>
            <input
              className="form-input"
              type="number"
              name="totalPrice"
              value={form.totalPrice}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="form-label">Cash</label>
            <input
              className="form-input"
              type="number"
              name="cash"
              value={form.cash}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="form-label">Change</label>
            <input
              className="form-input"
              type="number"
              name="changeAmount"
              value={form.changeAmount}
              onChange={handleChange}
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderFormDrawer;
