import axios from "axios";
import { API_URL } from "../enum";
import { getTokenAsync } from "./global-services";

const ordersURL = `${API_URL.BASE_URL}${API_URL.ORDERS}`;

export const fetchOrderList = async ({
  startDate = null,
  endDate = null,
  sortBy = "orderTime",
  sortDirection = "ASC",
}) => {
  try {
    const storedToken = await getTokenAsync();

    const response = await axios.get(ordersURL, {
      params: {
        startDate,
        endDate,
        sortBy,
        sortDirection,
      },
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });

    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const updateOrderStatus = async (orderId, status = "DONE") => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.patch(
      `${ordersURL}/${orderId}/status`,
      { orderStatus: status },
      {
        params: { status },
        headers: {
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.delete(`${ordersURL}/${orderId}`, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const updateOrder = async (orderId, payload) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.put(`${ordersURL}/${orderId}`, payload, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};