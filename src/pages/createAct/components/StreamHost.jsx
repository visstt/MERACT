import React, { useEffect, useRef, useState } from "react";

import AgoraRTC from "agora-rtc-sdk-ng";

import api from "../../../shared/api/api";
import { useAuthStore } from "../../../shared/stores/authStore";

// Функция для извлечения данных из JWT токена
const parseJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
};

const StreamHost = ({ actId, actTitle, onStopStream }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const localVideoRef = useRef(null);
  const clientRef = useRef(null);
  const localTracksRef = useRef({});
  const isInitializingRef = useRef(false); // Флаг для предотвращения множественной инициализации
  const isStreamingStartedRef = useRef(false); // Флаг для предотвращения множественного запуска стрима

  // Получаем пользователя из auth store
  const { user } = useAuthStore();

  // Извлекаем ID пользователя (используем сначала user.id, потом из токена)
  let baseUserId;
  if (user?.id) {
    baseUserId = user.id;
  } else if (user?.token) {
    const tokenData = parseJWT(user.token);
    baseUserId = tokenData?.sub || tokenData?.id || 999999;
  } else {
    baseUserId = 999999; // Фиксированный fallback
  }

  // Создаем уникальный UID для стримера: актId + userId + роль
  const userId = parseInt(`${actId}${baseUserId}2`); // актId + userId + роль(2=publisher)

  console.log(
    "StreamHost user data:",
    user,
    "baseUserId:",
    baseUserId,
    "userId:",
    userId,
  );

  // Генерируем channel ID на основе actId
  const channelName = `act_${actId}`;

  useEffect(() => {
    // Получаем токен для стрима
    const getStreamToken = async () => {
      // Предотвращаем множественную инициализацию
      if (isInitializingRef.current) {
        console.log("Already initializing, skipping...");
        return;
      }

      isInitializingRef.current = true;

      try {
        console.log(
          "Getting stream token for channel:",
          channelName,
          "userId:",
          userId,
        );

        // Получаем токен с вашего бэкенда для publisher (стример)
        const response = await api.get(
          `/act/token/${channelName}/PUBLISHER/uid?uid=${userId}&expiry=3600`,
        );
        setToken(response.data.token);

        console.log("Token received:", response.data.token);

        // Автоматически запускаем стрим только один раз
        if (!isStreamingStartedRef.current) {
          isStreamingStartedRef.current = true;
          console.log("Starting stream automatically...");
          await startStreaming();
        }
      } catch (err) {
        console.error("Error getting stream token:", err);
        setError("Failed to get stream token");
      } finally {
        isInitializingRef.current = false;
      }
    };

    getStreamToken();

    // Cleanup при размонтировании
    return () => {
      isInitializingRef.current = false;
      isStreamingStartedRef.current = false;
      if (isStreaming) {
        stopStreaming();
      }
      stopCameraPreview();
    };
  }, [actId, channelName, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Функция для запуска превью камеры
  const startCameraPreview = async () => {
    try {
      console.log("Starting camera preview...");

      // Проверяем разрешения и создаем превью
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log("Camera preview started successfully");
      }

      // Сохраняем поток для последующей остановки
      localTracksRef.current.previewStream = stream;
    } catch (err) {
      console.error("Error starting camera preview:", err);
      setError("Failed to access camera: " + err.message);
    }
  };

  // Функция для остановки превью камеры
  const stopCameraPreview = () => {
    try {
      if (localTracksRef.current.previewStream) {
        localTracksRef.current.previewStream.getTracks().forEach((track) => {
          track.stop();
        });
        localTracksRef.current.previewStream = null;
        console.log("Camera preview stopped");
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    } catch (err) {
      console.error("Error stopping camera preview:", err);
    }
  };

  const startStreaming = async () => {
    if (!token) {
      setError("No token available");
      return;
    }

    try {
      setIsStreaming(true);
      setError(null);

      console.log("Starting stream for act:", actId, "channel:", channelName);

      // Останавливаем превью камеры
      stopCameraPreview();

      // Создаем Agora клиент
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      console.log("Agora client created, joining channel...");

      // Подключаемся к каналу
      await client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        channelName,
        token,
        userId, // uid пользователя из auth store
      );

      console.log("Joined channel successfully");

      // Создаем треки
      console.log("Creating camera and microphone tracks...");
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();

      localTracksRef.current = { audioTrack, videoTrack };

      // Воспроизводим локальное видео
      if (localVideoRef.current) {
        console.log("Playing local video...");
        videoTrack.play(localVideoRef.current);
      }

      // Публикуем треки
      console.log("Publishing tracks...");
      await client.publish([audioTrack, videoTrack]);

      console.log("Stream started successfully");
    } catch (err) {
      console.error("Error starting stream:", err);
      setError("Failed to start stream: " + err.message);
      setIsStreaming(false);
    }
  };

  const stopStreaming = async () => {
    try {
      console.log("Stopping stream for act:", actId);

      // Останавливаем и закрываем треки
      if (localTracksRef.current.audioTrack) {
        localTracksRef.current.audioTrack.stop();
        localTracksRef.current.audioTrack.close();
      }
      if (localTracksRef.current.videoTrack) {
        localTracksRef.current.videoTrack.stop();
        localTracksRef.current.videoTrack.close();
      }

      // Покидаем канал
      if (clientRef.current) {
        await clientRef.current.leave();
      }

      // Очищаем ссылки
      localTracksRef.current = {};
      clientRef.current = null;

      setIsStreaming(false);

      // Уведомляем родительский компонент
      if (onStopStream) {
        onStopStream();
      }

      console.log("Stream stopped successfully");

      // Возвращаемся к превью камеры
      startCameraPreview();
    } catch (err) {
      console.error("Error stopping stream:", err);
      setError("Failed to stop stream: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Stream Control - {actTitle}</h2>

      {error && (
        <div
          style={{
            color: "red",
            background: "#ffebee",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          Error: {error}
        </div>
      )}

      <div
        style={{
          background: "#f5f5f5",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <p>
          <strong>Act ID:</strong> {actId}
        </p>
        <p>
          <strong>Channel:</strong> {channelName}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {isStreaming ? "🔴 LIVE ON AIR" : "⚪ PREPARING..."}
        </p>
        <p>
          <strong>Token:</strong> {token ? "✅ Ready" : "❌ Loading..."}
        </p>
      </div>

      {/* Видео контейнер */}
      <div
        style={{
          width: "100%",
          height: "400px",
          background: "#000",
          borderRadius: "8px",
          marginBottom: "20px",
          overflow: "hidden",
        }}
      >
        <video
          ref={localVideoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          autoPlay
          muted
          playsInline
        />
      </div>

      {/* Кнопки управления */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {!isStreaming ? (
          <button
            onClick={startStreaming}
            disabled={!token}
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: token ? "pointer" : "not-allowed",
              fontSize: "16px",
            }}
          >
            🔴 Go Live!
          </button>
        ) : (
          <button
            onClick={stopStreaming}
            style={{
              background: "#f44336",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ⏹️ End Stream
          </button>
        )}
      </div>

      {/* Информация для пользователя */}
      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          color: "#666",
          fontSize: "14px",
        }}
      >
        <p>
          <strong>� Auto-Stream Active:</strong> Your stream started
          automatically. Viewers can now watch your broadcast!
        </p>
      </div>
    </div>
  );
};

export default StreamHost;
