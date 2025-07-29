import React, { useEffect, useRef, useState } from "react";

// import { useNavigate } from "react-router-dom"; // Временно не используется

import { useAgora } from "../hooks/useAgora.js";
import { startStream } from "../services/streamApi.js";
import styles from "./StartStream.module.css";

export default function StartStream() {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    photo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const videoPreviewRef = useRef(null);

  const {
    joinAsPublisher,
    localVideoTrack,
    localAudioTrack,
    isPublishing,
    createCameraPreview,
    stopCameraPreview,
  } = useAgora();
  // const navigate = useNavigate(); // Закомментировано, так как не используется

  // Автоматически запускаем камеру при монтировании компонента
  useEffect(() => {
    const initCamera = async () => {
      try {
        if (!localVideoTrack) {
          console.log("Initializing camera on component mount...");
          await createCameraPreview();
        }
      } catch (error) {
        console.error("Error initializing camera:", error);
      }
    };

    initCamera();
  }, [createCameraPreview, localVideoTrack]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Эффект для отображения видеотрека в превью
  useEffect(() => {
    if (localVideoTrack && videoPreviewRef.current) {
      console.log("Playing video in preview element");
      console.log("Video track object:", localVideoTrack);
      console.log("Video preview element:", videoPreviewRef.current);
      try {
        localVideoTrack.play(videoPreviewRef.current);
        console.log("Video track started playing successfully");
      } catch (error) {
        console.error("Error playing video track:", error);
      }
    } else {
      if (!localVideoTrack) console.log("No localVideoTrack available");
      if (!videoPreviewRef.current)
        console.log("No videoPreviewRef.current available");
    }
  }, [localVideoTrack]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      // Только если реально размонтируемся, а не перерендеривается
      if (!isPublishing) {
        stopCameraPreview();
      }
    };
  }, [stopCameraPreview, isPublishing]);

  const handleStartStream = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    // Если превью не запущено, запускаем его сначала
    if (!localVideoTrack) {
      try {
        await createCameraPreview();
      } catch (error) {
        alert("Не удалось получить доступ к камере: " + error.message);
        return;
      }
    }

    setIsLoading(true);
    try {
      // Отправляем запрос на начало стрима
      const response = await startStream(formData);
      setStreamData(response);

      console.log("Response from server:", response);
      console.log("Will join with:", {
        token: response.token,
        streamName: response.streamName,
        streamId: response.streamId,
        userId: response.userId,
      });

      // Проверяем наличие токена
      if (!response.token) {
        throw new Error("Токен не получен от сервера");
      }

      // Присоединяемся к Agora каналу как publisher с правильным токеном и userId
      await joinAsPublisher(
        response.token, // Убедимся, что токен передаётся
        response.streamName,
        response.userId, // Используем userId из ответа
      );

      console.log("Stream started successfully:", response);
      console.log("Local tracks after publishing:", {
        localVideoTrack: localVideoTrack?.trackMediaType,
        localAudioTrack: localAudioTrack?.trackMediaType,
        videoEnabled: localVideoTrack?.enabled,
        audioEnabled: localAudioTrack?.enabled,
        videoMuted: localVideoTrack?.muted,
        audioMuted: localAudioTrack?.muted,
        isPublishing,
      });

      // Переходим на страницу стримов
      // navigate("/acts");
    } catch (error) {
      console.error("Error starting stream:", error);
      alert("Ошибка при запуске стрима: " + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.startStream}>
      <h1>Начать стрим</h1>

      <form onSubmit={handleStartStream} className={styles.form}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Название стрима"
          required
        />

        <input
          type="number"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          placeholder="ID категории (например: 2)"
          required
        />

        <input
          type="file"
          name="photo"
          onChange={handleInputChange}
          accept="image/*"
          placeholder="Превью изображение"
        />

        <button type="submit" disabled={isLoading || isPublishing}>
          {isLoading
            ? "Запуск..."
            : isPublishing
              ? "Стрим идет"
              : "Начать стрим"}
        </button>
      </form>

      {/* Превью камеры всегда показывается */}
      <div className={styles.videoPreview}>
        <h3>Превью стрима</h3>
        <div
          ref={videoPreviewRef}
          className={styles.videoContainer}
          style={{
            width: "100%",
            height: "300px",
            backgroundColor: "#000",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
        {!localVideoTrack && <p>Инициализация камеры...</p>}
        {localVideoTrack && <p>Камера готова к стримингу</p>}
      </div>

      {streamData && (
        <div className={styles.streamInfo}>
          <h3>Информация о стриме</h3>
          <p>ID: {streamData.streamId}</p>
          <p>Название: {streamData.streamName}</p>
          <p>Статус: {streamData.status}</p>
          <p>Роль: {streamData.role}</p>
          {isPublishing && <p style={{ color: "#58d0ff" }}>🔴 Стрим активен</p>}
        </div>
      )}
    </div>
  );
}
