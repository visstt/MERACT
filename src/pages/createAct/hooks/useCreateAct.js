import { useState } from "react";

import api from "../../../shared/api/api";
import { useActsStore } from "../../../shared/stores/actsStore";
import { useAuthStore } from "../../../shared/stores/authStore";
import { validateActData } from "../../../shared/types/act";

// Function to translate technical validation errors into user-friendly messages
const translateErrorMessage = (errorMessage) => {
  // Handle array of errors (from validation response)
  if (Array.isArray(errorMessage)) {
    const translatedErrors = errorMessage.map((err) =>
      translateSingleError(err),
    );
    // Remove duplicates by converting to Set and back to Array
    const uniqueErrors = [...new Set(translatedErrors)];
    return uniqueErrors.join("\n");
  }

  // Handle single error message
  return translateSingleError(errorMessage);
};

const translateSingleError = (error) => {
  const errorStr = error.toLowerCase();

  // Group sequel-related validation errors
  if (errorStr.includes("sequel id must be")) {
    return "Please select a valid sequel or create a new one";
  }

  // Group intro-related validation errors
  if (errorStr.includes("intro id must be")) {
    return "Please select a valid intro video from Scene Control";
  }

  // Group outro-related validation errors
  if (errorStr.includes("outro id must be")) {
    return "Please select a valid outro video from Scene Control";
  }

  // Group music-related validation errors
  if (errorStr.includes("music id must be")) {
    return "Please select valid background music from Scene Control";
  }

  // General validation errors
  if (errorStr.includes("title is required")) {
    return "Please enter a title for your act";
  }

  if (errorStr.includes("invalid act type")) {
    return "Please select a valid act type (Single or Multi)";
  }

  if (errorStr.includes("invalid act format")) {
    return "Please select a valid act format";
  }

  if (errorStr.includes("invalid hero selection method")) {
    return "Please select how you want to choose the hero";
  }

  if (errorStr.includes("invalid navigator selection method")) {
    return "Please select how you want to choose the navigator";
  }

  if (errorStr.includes("bidding time is required")) {
    return "Please set the bidding time for your act";
  }

  if (errorStr.includes("user not authenticated")) {
    return "Please log in to create an act";
  }

  // Network/server errors
  if (errorStr.includes("network error") || errorStr.includes("fetch")) {
    return "Network connection problem. Please check your internet and try again";
  }

  if (errorStr.includes("500") || errorStr.includes("internal server error")) {
    return "Server is temporarily unavailable. Please try again in a moment";
  }

  if (errorStr.includes("400") || errorStr.includes("bad request")) {
    return "Some information is missing or incorrect. Please check your inputs";
  }

  if (errorStr.includes("401") || errorStr.includes("unauthorized")) {
    return "Your session has expired. Please log in again";
  }

  if (errorStr.includes("403") || errorStr.includes("forbidden")) {
    return "You don't have permission to create acts. Please contact support";
  }

  // Default fallback
  return error || "Something went wrong. Please try again";
};

export function useCreateAct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuthStore();
  const { addAct } = useActsStore();

  const createAct = async (actData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Валидация данных
      const validationErrors = validateActData(actData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      // Проверяем что пользователь авторизован
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Подготавливаем FormData для отправки файла
      const formData = new FormData();

      // Добавляем обязательные поля
      formData.append("title", actData.title);
      formData.append("type", actData.type);
      formData.append("format", actData.format);
      formData.append("heroMethods", actData.heroMethods);
      formData.append("navigatorMethods", actData.navigatorMethods);
      formData.append("biddingTime", actData.biddingTime);
      formData.append("userId", user.id.toString());

      // Добавляем опциональные поля
      if (actData.sequel) {
        formData.append("sequel", actData.sequel);
      }

      if (actData.sequelId) {
        formData.append("sequelId", actData.sequelId.toString());
      }

      if (actData.introId) {
        formData.append("introId", actData.introId.toString());
      }

      if (actData.outroId) {
        formData.append("outroId", actData.outroId.toString());
      }

      if (actData.musicId) {
        formData.append("musicId", actData.musicId.toString());
      }

      // Добавляем файл если есть
      if (actData.photo) {
        formData.append("photo", actData.photo);
      }

      console.log("Creating act with data:", {
        title: actData.title,
        type: actData.type,
        format: actData.format,
        heroMethods: actData.heroMethods,
        navigatorMethods: actData.navigatorMethods,
        biddingTime: actData.biddingTime,
        userId: user.id,
        hasPhoto: !!actData.photo,
        sequelId: actData.sequelId,
        introId: actData.introId,
        outroId: actData.outroId,
        musicId: actData.musicId,
      });

      // Отправляем запрос
      const response = await api.post("/act/create-act", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setLoading(false);

      console.log("Act created successfully:", response.data);

      // Добавляем созданный акт в store
      addAct({
        ...actData,
        userId: user.id,
        actId: response.data.actId,
        imageUrl: actData.photo ? URL.createObjectURL(actData.photo) : null,
      });

      // Note: Navigation is handled by the calling component (CreateAct.jsx)
      // navigate(`/stream-host/${response.data.actId}`);

      return response.data; // { message: 'Stream launched successfully', actId: number }
    } catch (err) {
      console.error("Error creating act:", err);

      let errorMessage = "Failed to create act";

      // Extract error message from response
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors;
      } else if (err.response?.data) {
        errorMessage = err.response.data;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Translate technical errors to user-friendly messages
      const friendlyError = translateErrorMessage(errorMessage);

      console.error("Translated error:", friendlyError);
      setError(friendlyError);
      setLoading(false);
      return null;
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  return {
    createAct,
    loading,
    error,
    success,
    resetState,
  };
}
