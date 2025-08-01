import axios from "axios";
import { API_URL } from "../enum";
import { getTokenAsync } from "./global-services";

const itemsURL = `${API_URL.BASE_URL}${API_URL.ITEMS}`;

export const fetchItemList = async () => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.get(itemsURL, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const deleteItem = async (itemTypeId) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.delete(`${itemsURL}/${itemTypeId}`, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const addItem = async (payload) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.post(itemsURL, payload, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const editItem = async (id, payload) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.put(`${itemsURL}/${id}`, payload, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};