import axios from "axios";
import { API_URL } from "../enum";
import { getTokenAsync } from "./global-services";

const itemTypesURL = `${API_URL.BASE_URL}${API_URL.ITEM_TYPES}`;

export const fetchItemTypes = async () => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.get(itemTypesURL, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const deleteItemType = async (itemTypeId) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.delete(`${itemTypesURL}/${itemTypeId}`, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const addItemType = async (payload) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.post(itemTypesURL, payload, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

export const editItemType = async (id, payload) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.put(`${itemTypesURL}/${id}`, payload, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};