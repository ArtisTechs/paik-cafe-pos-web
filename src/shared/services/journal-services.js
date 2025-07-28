import axios from "axios";
import { API_URL } from "../enum"; // Assume API_URL includes the base URL
import { getTokenAsync } from "./global-services";

// Journal API URL
const journalsURL = `${API_URL.BASE_URL}${API_URL.JOURNALS}`;

// Fetch all journals with sorting and ordering
export const fetchAllJournals = async ({
  sortBy = "createdAt",
  asc = true,
}) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.get(journalsURL, {
      params: {
        sortBy,
        asc,
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

// Fetch journals for a specific user
export const fetchJournalsByUser = async ({
  userId,
  sortBy = "createdAt",
  asc = true,
}) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.get(`${journalsURL}/user/${userId}`, {
      params: {
        sortBy,
        asc,
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

// Fetch a single journal by its ID
export const fetchJournalById = async (id) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.get(`${journalsURL}/${id}`, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

// Create a new journal entry for a user
export const createJournal = async (userId, journalData) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.post(
      `${journalsURL}/user/${userId}`,
      journalData,
      {
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

// Update an existing journal entry by its ID
export const updateJournal = async (id, journalData) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.put(`${journalsURL}/${id}`, journalData, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};

// Delete a journal entry by its ID
export const deleteJournal = async (id) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.delete(`${journalsURL}/${id}`, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};
