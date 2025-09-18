import { useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../shared/api/api";
import { useActsStore } from "../../../shared/stores/actsStore";
import { useAuthStore } from "../../../shared/stores/authStore";
import { validateActData } from "../../../shared/types/act";

export function useCreateAct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuthStore();
  const { addAct } = useActsStore();
  const navigate = useNavigate();

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

      // Перенаправляем на страницу стримера
      navigate(`/stream-host/${response.data.actId}`);

      return response.data; // { message: 'Stream launched successfully', actId: number }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create act";
      console.error("Error creating act:", errorMessage);
      setError(errorMessage);
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
