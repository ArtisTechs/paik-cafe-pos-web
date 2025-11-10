// src/services/position-service.js
import axios from "axios";
import { API_URL } from "../enum";
import { getTokenAsync } from "./global-services";

const CURRENT_POSITION_URL = `${API_URL.BASE_URL}${API_URL.ROBOT_POSITIONS}${API_URL.CURRENT}`;

export const getCurrentPosition = async () => {
  try {
    const res = await axios.get(CURRENT_POSITION_URL, {
      responseType: "text",
      transformResponse: [(data) => data],
      headers: { Accept: "text/plain" },
    });

    const text = String(res.data || "").trim();
    return { key: text, currentPosition: text };
  } catch (error) {
    throw error.response;
  }
};

export function extractTableNumberFromPosition(pos) {
  const key = pos?.key?.toLowerCase().trim();
  if (!key || key === "starting" || key === "start") return "";
  const m = key.match(/table\s*([0-9]+)/i) || key.match(/table([0-9]+)/i);
  return m?.[1] ?? "";
}

export const updateCurrentPosition = async (position) => {
  try {
    const token = await getTokenAsync();

    const res = await axios.put(CURRENT_POSITION_URL, null, {
      params: { position },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return res.status >= 200 && res.status < 300;
  } catch (error) {
    throw error.response;
  }
};
