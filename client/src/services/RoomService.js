import axios from "axios";

const API_BASE_URL = "/api/v1/rooms";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createRoomApi = async (roomId) => {
  // Backend expects plain string for create room, not JSON object
  const response = await api.post("/", roomId, {
    headers: { "Content-Type": "text/plain" },
  });
  return response.data;
};

export const joinChatApi = async (roomId) => {
  const response = await api.get(`/${roomId}`);
  return response.data;
};

export const getMessagesApi = async (roomId) => {
  // Note: Backend has a typo "massages"
  const response = await api.get(`/${roomId}/massages`);
  return response.data;
};
