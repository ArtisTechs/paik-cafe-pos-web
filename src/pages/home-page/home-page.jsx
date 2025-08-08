import React, { useEffect, useState } from "react";
import "./home-page.css";
import {
  deleteOrder,
  EErrorMessages,
  fetchOrderList,
  formatDate,
  getFilterDates,
  modalService,
  toastService,
  updateOrderStatus,
} from "../../shared";
import OrderFormDrawer from "../order-form/order-form-drawer";

const FILTER_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7" },
  { label: "Last 30 Days", value: "last30" },
  { label: "This Month", value: "thisMonth" },
];

const HomePage = ({ setFullLoadingHandler }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("today");
  const [editOrder, setEditOrder] = useState(null);

  const handleEditOrder = (order) => {
    setEditOrder(order);
  };
  const handleCloseDrawer = () => {
    setEditOrder(null);
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line
  }, [filter]);

  const loadOrders = async () => {
    setFullLoadingHandler(true);

    const { startDate, endDate } = getFilterDates(filter);

    try {
      const response = await fetchOrderList({
        startDate,
        endDate,
        sortBy: "orderTime",
        sortDirection: "ASC",
      });

      setOrders(response.content || response);
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setFullLoadingHandler(false);
    }
  };

  const handleMarkAsDone = async (orderId) => {
    setFullLoadingHandler(true);
    try {
      await updateOrderStatus(orderId, "DONE");
      await loadOrders();
      toastService.show("Order marked as DONE", "success-toast");
    } catch (error) {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setFullLoadingHandler(false);
    }
  };

  const handleDeleteOrder = (order) => {
    modalService.show({
      title: "Delete Order?",
      message: `Are you sure you want to delete Order #${order.orderNo}? This action cannot be undone.`,
      confirmText: "Delete",
      confirmButtonClass: "danger-button",
      onConfirm: async () => {
        setFullLoadingHandler(true);
        try {
          await deleteOrder(order.id);
          await loadOrders();
          toastService.show(
            `Order #${order.orderNo} deleted successfully.`,
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

  function getUniqueOrderItems(order) {
    const seen = new Set();
    const unique = [];
    for (let i = 0; i < order.items.length; i++) {
      const name = order.items[i].name;
      const variation = order.variation[i];
      const key = name + "||" + variation;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({
          name,
          variation,
          quantity: order.quantity[i], // just take the first found
        });
      }
    }
    return unique;
  }

  const totalOrders = orders.length;
  const totalIncome = orders.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0
  );
  const totalDoneOrders = orders.filter(
    (order) => order.orderStatus === "DONE"
  ).length;

  const { startDate, endDate } = getFilterDates(filter);
  const displayStart = formatDate(startDate, "MMM DD, YYYY");
  const displayEnd = formatDate(endDate, "MMM DD, YYYY");

  return (
    <div className="home-page">
      <h2>Orders</h2>
      <div className="order-summary-section">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-title">Total Orders</div>
            <div className="summary-value">{totalOrders}</div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Total Income</div>
            <div className="summary-value">₱{totalIncome.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Done Orders</div>
            <div className="summary-value">{totalDoneOrders}</div>
          </div>
        </div>
        <div className="filter-dropdown">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="order-filter-select"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="filter-date-range">
            <span>
              {displayStart} - {displayEnd}
            </span>
          </div>
        </div>
      </div>

      <div className="order-grid-scroll-container">
        <div className="order-grid">
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                {order.orderStatus != "DONE" && (
                  <button
                    className="edit-btn-home"
                    onClick={() => handleEditOrder(order)}
                    title="Edit Order"
                  >
                    <i className="fa fa-pencil" />
                  </button>
                )}

                <h3 className="fw-bold">
                  Order #{order.orderNo}{" "}
                  {order.orderStatus === "DONE" && (
                    <i
                      className="fa fa-check-circle"
                      style={{ color: "#28a745", marginLeft: "0.5rem" }}
                      title="Completed"
                    ></i>
                  )}
                </h3>
                <p className="mb-0">
                  <span className="badge ">
                    {order.orderType === "DINE_IN"
                      ? "Dine In"
                      : order.orderType === "TAKE_OUT"
                      ? "Take Out"
                      : order.orderType}
                  </span>
                </p>
                <p>
                  Status: <span className="fw-bold">{order.orderStatus}</span>
                </p>
                <p>
                  Total:{" "}
                  <span className="fw-bold">
                    ₱{order.totalPrice.toFixed(2)}
                  </span>
                </p>
                <p>
                  Cash:{" "}
                  <span className="fw-bold">₱{order.cash?.toFixed(2)}</span>
                </p>
                <p>
                  Change:{" "}
                  {order.changeAmount != null ? (
                    <span className="fw-bold">
                      ₱{order.changeAmount.toFixed(2)}
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
                <p className="m-0 fw-bold">Orders:</p>
                <ul>
                  {getUniqueOrderItems(order).map((ci, idx) => (
                    <li className="fw-bold" key={idx}>
                      {ci.name} - {ci.variation} x {ci.quantity}
                    </li>
                  ))}
                </ul>
                <div className="mb-5 italic">
                  <small>
                    {formatDate(order.orderTime, "YYYY-MM-DD HH:mm:ss")}
                  </small>
                </div>

                <div className="button-container-order-card">
                  {order.orderStatus !== "DONE" && (
                    <button
                      className="success-button"
                      onClick={() => handleMarkAsDone(order.id)}
                    >
                      Mark as Done
                    </button>
                  )}
                  <button
                    className="danger-button"
                    onClick={() => handleDeleteOrder(order)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <OrderFormDrawer
        open={!!editOrder}
        order={editOrder}
        onClose={handleCloseDrawer}
        onSaved={() => {
          handleCloseDrawer();
          loadOrders();
        }}
      />
    </div>
  );
};

export default HomePage;
