// services/web-socket-services.js
import { API_URL } from "../enum";
import { STORAGE_KEY } from "../keys";

const BACKEND_WS_IP = API_URL.MAIN_URL;

function toWsUrl(httpLike) {
  const base = httpLike.replace(/^http(s?):\/\//, (_m, s) =>
    s ? "wss://" : "ws://"
  );
  return base.endsWith("/ws") ? base : base.replace(/\/+$/, "") + "/ws";
}

const WebStorage = {
  async getItem(key) {
    try {
      return typeof window !== "undefined"
        ? window.localStorage.getItem(key)
        : null;
    } catch {
      return null;
    }
  },
};

class WebSocketService {
  constructor() {
    this.ws = null;
    this.branchId = null;
    this.onMessage = null;
    this.outbox = [];
    this.isOpen = false;

    this.reconnectAttempts = 0;
    this.forcedClose = false;
    this.RECONNECT_BASE_MS = 500;
    this.RECONNECT_MAX_MS = 30000;
  }

  async connect(onMessage) {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING ||
        this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.branchId = await WebStorage.getItem(STORAGE_KEY.BRANCH_ID);
    if (!this.branchId) throw new Error("No branchId found in storage");

    const wsUrl = toWsUrl(BACKEND_WS_IP);
    const ws = new WebSocket(wsUrl);
    this.ws = ws;
    this.onMessage = onMessage;
    this.isOpen = false;
    this.forcedClose = false;

    ws.onopen = () => {
      this.isOpen = true;
      this.reconnectAttempts = 0;
      console.log("[WebSocket] Connected");
      this.send({
        type: "controller",
        status: "connected",
        branchId: this.branchId,
      });
      this.flushOutbox();
    };

    ws.onmessage = (event) => {
      const raw = event.data;
      try {
        const data = JSON.parse(raw);
        this.onMessage && this.onMessage(data);
      } catch {
        this.onMessage && this.onMessage(raw);
      }
    };

    ws.onclose = (e) => {
      console.warn("[WebSocket] Closed:", e.code, e.reason || "");
      this.isOpen = false;
      this.ws = null;
      if (!this.forcedClose) this._scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.error("[WebSocket] Error:", err);
    };

    this._attachPageListeners();
  }

  _attachPageListeners() {
    if (this._listenersAttached) return;
    this._listenersAttached = true;

    window.addEventListener("online", () => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED)
        this._scheduleReconnect(true);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED)
          this._scheduleReconnect(true);
      }
    });
  }

  _scheduleReconnect(immediate = false) {
    if (this.forcedClose) return;
    const attempt = this.reconnectAttempts++;
    const delay = immediate
      ? 0
      : Math.min(this.RECONNECT_MAX_MS, this.RECONNECT_BASE_MS * 2 ** attempt) *
        (0.5 + Math.random() * 0.5);
    console.log(
      `[WebSocket] Reconnect in ${Math.round(delay)}ms (attempt ${attempt + 1})`
    );
    setTimeout(() => this.connect(this.onMessage), delay);
  }

  flushOutbox() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    while (this.outbox.length) this._sendNow(this.outbox.shift());
  }

  _sendNow(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(typeof data === "string" ? data : JSON.stringify(data));
    } catch (err) {
      console.error("[WebSocket] Send failed:", err);
    }
  }

  send(data) {
    if (this.isOpen && this.ws && this.ws.readyState === WebSocket.OPEN)
      this._sendNow(data);
    else this.outbox.push(data);
  }

  close() {
    this.forcedClose = true;
    this.isOpen = false;
    this.outbox.length = 0;
    if (this.ws) {
      try {
        this.ws.close(1000, "client_close");
      } catch {}
      this.ws = null;
    }
  }
}

export default new WebSocketService();
