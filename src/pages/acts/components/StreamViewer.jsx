import React, { useEffect, useRef, useState } from "react";

import AgoraRTC from "agora-rtc-sdk-ng";
import { useNavigate } from "react-router-dom";

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

const StreamViewer = ({ channelName, streamData, onClose }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [, setError] = useState(null);
  const [, setToken] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const remoteVideoRef = useRef(null);
  const clientRef = useRef(null);
  const isConnectingRef = useRef(false); // Флаг для предотвращения двойного подключения

  // Получаем пользователя из auth store
  const { user } = useAuthStore();

  // Извлекаем ID пользователя (используем сначала user.id, потом из токена)
  let baseUserId;
  if (user?.id) {
    baseUserId = user.id;
  } else if (user?.token) {
    const tokenData = parseJWT(user.token);
    baseUserId = tokenData?.sub || tokenData?.id || 888888;
  } else {
    baseUserId = 888888; // Фиксированный fallback для анонимных пользователей
  }

  // Создаем уникальный UID для зрителя: streamId + userId + роль
  const streamId =
    channelName?.replace("act_", "") || streamData?.id || "default";
  const userId = parseInt(`${streamId}${baseUserId}1`); // streamId + userId + роль(1=subscriber)

  console.log(
    "StreamViewer user data:",
    user,
    "baseUserId:",
    baseUserId,
    "userId:",
    userId,
  );

  // Используем переданный channelName или создаем из streamData
  const actualChannelName = channelName?.startsWith("act_")
    ? channelName
    : `act_${channelName || streamData?.id || "default"}`;

  useEffect(() => {
    // Получаем токен для просмотра
    const getViewerToken = async () => {
      // Предотвращаем двойное подключение
      if (isConnectingRef.current) {
        console.log("Already connecting, skipping...");
        return;
      }

      isConnectingRef.current = true;

      try {
        console.log(
          "Getting viewer token for channel:",
          actualChannelName,
          "userId:",
          userId,
        );

        // Получаем токен с вашего бэкенда для subscriber (зритель)
        // Используем userId из auth store
        const response = await api.get(
          `/act/token/${actualChannelName}/SUBSCRIBER/uid?uid=${userId}&expiry=3600`,
        );
        setToken(response.data.token);

        console.log("Viewer token received:", response.data.token);

        // Автоматически подключаемся после получения токена
        await connectToStream(response.data.token);
      } catch (err) {
        console.error("Error getting viewer token:", err);
        setError("Failed to get viewer token");
      } finally {
        isConnectingRef.current = false;
      }
    };

    getViewerToken();

    // Cleanup при размонтировании
    return () => {
      isConnectingRef.current = false;
      if (isConnected && clientRef.current) {
        disconnectFromStream();
      }
    };
  }, [streamData?.id, actualChannelName, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectToStream = async (streamToken) => {
    if (!streamToken) {
      setError("No token available");
      return;
    }

    try {
      setIsConnected(false);
      setError(null);

      console.log(
        "Connecting to stream for act:",
        streamData?.id,
        "channel:",
        actualChannelName,
        "token:",
        streamToken,
      );

      // Создаем Agora клиент для зрителя
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      console.log("Agora client created, attempting to join...");

      // Подключаемся к каналу как зритель
      await client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        actualChannelName,
        streamToken,
        userId, // uid пользователя из auth store
      );

      console.log("Successfully joined channel as viewer");
      setIsConnected(true);

      // Слушаем события пользователей
      client.on("user-published", async (user, mediaType) => {
        console.log("User published:", user.uid, mediaType);

        // Подписываемся на пользователя
        await client.subscribe(user, mediaType);

        if (mediaType === "video" && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }

        setRemoteUsers((prev) => [
          ...prev.filter((u) => u.uid !== user.uid),
          user,
        ]);
      });

      client.on("user-unpublished", (user) => {
        console.log("User unpublished:", user.uid);
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      console.log("Connected to stream successfully");
    } catch (err) {
      console.error("Error connecting to stream:", err);
      setError("Failed to connect to stream: " + err.message);
      setIsConnected(false);
    }
  };

  const disconnectFromStream = async () => {
    try {
      console.log("Disconnecting from stream:", streamData?.id);

      // Покидаем канал
      if (clientRef.current) {
        await clientRef.current.leave();
      }

      // Очищаем ссылки
      clientRef.current = null;

      setIsConnected(false);
      setRemoteUsers([]);

      console.log("Disconnected from stream successfully");
    } catch (err) {
      console.error("Error disconnecting from stream:", err);
      setError("Failed to disconnect from stream: " + err.message);
    }
  };

  const handleClose = async () => {
    // Отключаемся от стрима
    await disconnectFromStream();

    // Вызываем callback если есть
    if (onClose) {
      onClose();
    }

    // Переходим на страницу acts
    navigate("/acts");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Заголовок с кнопкой закрытия */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            color: "white",
            margin: 0,
            fontSize: "18px",
            fontWeight: 600,
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          🔴 {streamData?.title || streamData?.name || "Live Stream"}
        </h2>
        <button
          onClick={handleClose}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
          }}
        >
          ✕
        </button>
      </div>

      {/* Полноэкранное видео */}
      <div
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          ref={remoteVideoRef}
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)",
          }}
        />
      </div>

      {/* Статус панель (внизу экрана) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          padding: "20px",
          color: "white",
          fontSize: "14px",
          zIndex: 1001,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                background: isConnected ? "#4CAF50" : "#f44336",
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {isConnected ? "🟢 LIVE" : "🔴 OFFLINE"}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#ccc" }}>
            👥 {remoteUsers.length} streaming
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamViewer;
