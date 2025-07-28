import axios from "axios";
import { API_URL } from "../enum";
import { getTokenAsync } from "./global-services";

const appointmentsURL = `${API_URL.BASE_URL}${API_URL.APPOINTMENTS}`;

// Fetch appointment list with filters, pagination, and sorting
export const fetchAppointmentList = async ({
  userId = null,
  startDate = null,
  endDate = null,
  status = "",
  page = 0,
  size = null,
  sortBy = "dateCreated",
  sortDirection = "ASC",
}) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.get(`${appointmentsURL}`, {
      params: {
        userId,
        startDate,
        endDate,
        status,
        page,
        size,
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

// Change appointment status
export const changeAppointmentStatus = async (id, statusUpdateDTO) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.put(
      `${appointmentsURL}${API_URL.STATUS}/${id}`,
      statusUpdateDTO,
      {
        headers: {
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        },
      }
    );
    return response.data; // Return the updated appointment object
  } catch (error) {
    throw error.response;
  }
};

// Create a new appointment
export const createAppointment = async (appointmentDTO) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.post(
      `${appointmentsURL}/create`,
      appointmentDTO,
      {
        headers: {
          ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        },
      }
    );
    return response.data; // Return the created appointment object
  } catch (error) {
    throw error.response;
  }
};

// Delete an appointment
export const deleteAppointment = async (id) => {
  try {
    const storedToken = await getTokenAsync();
    const response = await axios.delete(`${appointmentsURL}/${id}`, {
      headers: {
        ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response;
  }
};
