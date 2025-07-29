import api from "../shared/api/api.js";

// Начать стрим
export const startStream = async (streamData) => {
  try {
    const formData = new FormData();
    formData.append("name", streamData.name);
    formData.append("categoryId", streamData.categoryId);
    if (streamData.photo) {
      formData.append("photo", streamData.photo);
    }

    const response = await api.post("/stream/start", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Stream API response:", response.data);

    if (response.data && response.data.token) {
      return {
        token: response.data.token,
        role: response.data.role || "publisher",
        streamId: response.data.streamId,
        streamName: response.data.streamName,
        status: response.data.status,
        startedAt: response.data.startedAt,
        previewFileName: response.data.previewFileName,
        userId: response.data.userId,
      };
    } else {
      throw new Error("Неверный формат ответа от сервера");
    }
  } catch (error) {
    console.error(
      "Error starting stream:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Получить список активных стримов
export const getActiveStreams = async () => {
  try {
    const response = await api.get("/stream/active-streams");
    return response.data;
  } catch (error) {
    console.error("Error fetching streams:", error);
    throw error;
  }
};

// Присоединиться к стриму (получить токен зрителя)
export const joinStream = async (streamId) => {
  try {
    console.log("Requesting viewer token for stream:", streamId);
    const response = await api.get(`/stream/join-stream?streamId=${streamId}`);

    console.log("Join stream API response:", {
      status: response.status,
      data: response.data,
      hasToken: !!(response.data && response.data.token),
    });

    if (response.data && response.data.token) {
      console.log("Join stream token details:", {
        tokenLength: response.data.token.length,
        role: response.data.role,
        streamName: response.data.streamName,
      });
    }

    return response.data;
  } catch (error) {
    console.error("Error joining stream:", error);
    console.error("API error details:", error.response?.data);
    throw error;
  }
};

// Остановить стрим
export const stopStream = async (streamId) => {
  try {
    const response = await api.post(`/stream/stop-stream?id=${streamId}`);
    return response.data;
  } catch (error) {
    console.error("Error stopping stream:", error);
    throw error;
  }
};
