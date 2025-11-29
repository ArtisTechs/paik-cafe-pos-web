import React, { useEffect, useRef, useState } from "react";
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
  getCurrentPosition,
} from "../../shared";
import OrderFormDrawer from "../order-form/order-form-drawer";
import webSocketService from "../../shared/services/web-socket-service";

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
  const [uiBusy, setUiBusy] = useState(false);

  // Staging center (max 3)
  // item: {orderId, orderNo, table, door, readySent, doorOpened}
  const [staged, setStaged] = useState([]);
  const [centerOpen, setCenterOpen] = useState(false);

  const mountedRef = useRef(false);
  const refreshDebounceRef = useRef(null);
  const pollRef = useRef(null);

  const handleEditOrder = (order) => setEditOrder(order);
  const handleCloseDrawer = () => setEditOrder(null);

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
    } catch {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setFullLoadingHandler(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const sendWS = (obj) => {
    try {
      webSocketService.send(JSON.stringify(obj));
      console.log("[WS] >>>", obj);
    } catch (e) {
      console.warn("[WS] send failed:", e?.message || e);
    }
  };

  const isStartingKey = (k) => {
    const x = String(k || "").toLowerCase();
    return x === "starting" || x === "start" || x === "start_point";
  };

  const doorForTable = (t) => Number(t); // 1→1, 2→2, 3→3

  // WS incoming
  useEffect(() => {
    mountedRef.current = true;

    const triggerRefresh = (why = "WS", delayMs = 250) => {
      clearTimeout(refreshDebounceRef.current);
      refreshDebounceRef.current = setTimeout(() => {
        if (document.visibilityState === "visible") loadOrders();
      }, delayMs);
    };

    const onWsMessage = (payload) => {
      if (!mountedRef.current) return;
      let msg = payload;
      if (typeof payload === "string") {
        try {
          msg = JSON.parse(payload);
        } catch {}
      }
      if (!msg || typeof msg !== "object") return;

      if (
        msg.type?.toLowerCase() === "payment" &&
        msg.status?.toLowerCase() === "complete"
      ) {
        triggerRefresh("PAYMENT_COMPLETE", 3000);
        return;
      }

      if (msg.type === "table_event") {
        if (msg.event === "ORDER_DELIVERED" || msg.event === "DONE_PICKUP") {
          // no UI state change here; dispatch flow handles DONE via API
          return;
        }
      }
    };

    webSocketService.connect(onWsMessage).catch(() => {});

    return () => {
      mountedRef.current = false;
      clearTimeout(refreshDebounceRef.current);
      try {
        webSocketService.close();
      } catch {}
    };
  }, []);

  // Poll robot position every 3s. When at STARTING, auto open any not-yet-opened staged doors.
  const clearPositionPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
  const startPositionPolling = () => {
    clearPositionPoll();
    pollRef.current = setInterval(async () => {
      try {
        const pos = await getCurrentPosition();
        const key = pos?.key || pos?.name || "";
        if (!isStartingKey(key)) return;

        setStaged((prev) => {
          const next = [...prev];
          for (let i = 0; i < next.length; i++) {
            const it = next[i];
            if (!it.doorOpened) {
              sendWS({
                type: "pickup",
                cmd: "open",
                table: Number(it.table),
                door: it.door,
              });
              next[i] = { ...it, doorOpened: true };
            }
          }
          return next;
        });
      } catch {}
    }, 3000);
  };
  useEffect(() => {
    if (centerOpen && staged.length > 0) startPositionPolling();
    else clearPositionPoll();
    return clearPositionPoll;
  }, [centerOpen, staged.length]);

  // Stage an order: do NOT update API status here
  const handleMarkAsDone = async (order) => {
    const table =
      order.tableNumber ??
      order.tableNo ??
      order.table?.number ??
      order.table ??
      null;

    if (!table) {
      toastService.show("No table. Cannot stage.", "danger-toast");
      return;
    }
    const t = Number(table);
    const d = doorForTable(t);

    setStaged((prev) => {
      // limit 3 and avoid duplicates per table
      if (prev.find((x) => x.table === t)) return prev;
      if (prev.length >= 3) {
        toastService.show("Max 3 staged.", "danger-toast");
        return prev;
      }
      return [
        ...prev,
        {
          orderId: order.id,
          orderNo: order.orderNo,
          table: t,
          door: d,
          readySent: false,
          doorOpened: false,
        },
      ];
    });
    setCenterOpen(true);

    try {
      // Send ORDER_READY immediately
      sendWS({ type: "table", id: t, cmd: "READY" });
      sendWS({ type: "table_event", event: "ORDER_READY", table: t });
      setStaged((prev) =>
        prev.map((x) => (x.table === t ? { ...x, readySent: true } : x))
      );

      // If already at STARTING, open now; else the poller will open later
      try {
        const pos = await getCurrentPosition();
        const key = pos?.key || pos?.name || "";
        if (isStartingKey(key)) {
          sendWS({ type: "pickup", cmd: "open", table: t, door: d });
          setStaged((prev) =>
            prev.map((x) => (x.table === t ? { ...x, doorOpened: true } : x))
          );
        }
      } catch {}
      toastService.show(
        `Staged Order #${order.orderNo} for Table ${t}`,
        "success-toast"
      );
    } catch {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    }
  };

  // Dispatch: close all opened doors then mark all staged orders DONE in API, then clear
  const handleDispatchAll = async () => {
    if (uiBusy || staged.length === 0) return;
    setUiBusy(true);
    try {
      // Close for items whose doorOpened == true; send close for all staged anyway
      for (const it of staged) {
        sendWS({ type: "pickup", cmd: "close", table: Number(it.table) });
      }

      const tables = staged.map((it) => Number(it.table));
      sendWS({ type: "dispatch", tables });

      // Commit DONE to API after dispatch
      for (const it of staged) {
        if (it.orderId) await updateOrderStatus(it.orderId, "DONE");
      }
      await loadOrders();
      setStaged([]);
      setCenterOpen(false);
      toastService.show("Dispatched. Orders marked DONE.", "success-toast");
    } catch {
      toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
    } finally {
      setUiBusy(false);
    }
  };

  const handleRemoveStaged = (table) => {
    setStaged((prev) => prev.filter((x) => x.table !== table));
    if (staged.length <= 1) setCenterOpen(false);
  };

  const handleDeleteOrder = (order) => {
    modalService.show({
      title: "Delete Order?",
      message: `Are you sure you want to delete Order #${order.orderNo}? This action cannot be undone.`,
      confirmText: "Delete",
      confirmButtonClass: "danger-button",
      onConfirm: async () => {
        setUiBusy(true);
        try {
          await deleteOrder(order.id);
          await loadOrders();
          toastService.show(
            `Order #${order.orderNo} deleted.`,
            "success-toast"
          );
        } catch {
          toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
        } finally {
          setUiBusy(false);
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
        unique.push({ name, variation, quantity: order.quantity[i] });
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
            disabled={uiBusy}
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
            orders.map((order) => {
              const tableNumber =
                order.tableNumber ??
                order.tableNo ??
                order.table?.number ??
                order.table ??
                null;

              return (
                <div key={order.id} className="order-card">
                  {order.orderStatus !== "DONE" && (
                    <button
                      className="edit-btn-home"
                      onClick={() => handleEditOrder(order)}
                      title="Edit Order"
                      disabled={uiBusy}
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
                    <span className="badge badge-info">
                      {tableNumber ? `Table #${tableNumber}` : "No Table"}
                    </span>
                  </p>

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
                        onClick={() => handleMarkAsDone(order)}
                        disabled={uiBusy}
                      >
                        Mark as Done
                      </button>
                    )}
                    {/* <button
                      className="danger-button"
                      onClick={() => handleDeleteOrder(order)}
                      disabled={uiBusy}
                    >
                      Delete
                    </button> */}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pickup Center (staging) */}
      {centerOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="fw-bold">Pickup Center</h3>

            {staged.length === 0 ? (
              <p>No staged orders.</p>
            ) : (
              <div className="staged-list">
                {staged.map((it) => (
                  <div key={it.table} className="staged-item">
                    <div className="staged-left">
                      <div className="fw-bold mb-2">
                        Order #{it.orderNo} • Table #{it.table} • Door {it.door}
                      </div>
                    </div>
                    <div className="staged-actions">
                      <button
                        className="secondary-button"
                        disabled={uiBusy}
                        onClick={() =>
                          sendWS({
                            type: "pickup",
                            cmd: "open",
                            table: it.table,
                            door: it.door,
                          })
                        }
                      >
                        Open
                      </button>
                      <button
                        className="secondary-button"
                        disabled={uiBusy}
                        onClick={() =>
                          sendWS({
                            type: "pickup",
                            cmd: "close",
                            table: it.table,
                          })
                        }
                      >
                        Close
                      </button>
                      <button
                        className="link-button"
                        disabled={uiBusy}
                        onClick={() => handleRemoveStaged(it.table)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="button-row mt-2">
              <button
                className="primary-button w-100"
                disabled={uiBusy || staged.length === 0}
                onClick={handleDispatchAll}
              >
                Dispatch All & Mark DONE
              </button>
              <button
                className="link-button w-100"
                onClick={() => {
                  setCenterOpen(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
