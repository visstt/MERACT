import React, { useEffect, useRef, useState } from "react";

import AgoraRTC from "agora-rtc-sdk-ng";
import { useNavigate } from "react-router-dom";

import api from "../../../shared/api/api";
import { useAuthStore } from "../../../shared/stores/authStore";
import styles from "./StreamViewer.module.css";

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
  const [streamDuration, setStreamDuration] = useState(0);
  const remoteVideoRef = useRef(null);
  const clientRef = useRef(null);
  const isConnectingRef = useRef(false); // Флаг для предотвращения двойного подключения
  const streamStartTimeRef = useRef(null);

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

  // Таймер для продолжительности стрима
  useEffect(() => {
    if (!isConnected) return;

    // Устанавливаем время начала стрима
    if (!streamStartTimeRef.current) {
      streamStartTimeRef.current = Date.now();
    }

    const timer = setInterval(() => {
      if (streamStartTimeRef.current) {
        const elapsed = Math.floor(
          (Date.now() - streamStartTimeRef.current) / 1000,
        );
        setStreamDuration(elapsed);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isConnected]);

  // Сброс таймера при отключении
  useEffect(() => {
    if (!isConnected) {
      streamStartTimeRef.current = null;
      setStreamDuration(0);
    }
  }, [isConnected]);

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
    <div className={styles.container}>
      {/* Шапка стрима */}
      <div className={styles.header}>
        {/* Верхняя строка: стрелка назад, заголовок, таймер */}
        <div className={styles.topRow}>
          <button onClick={handleClose} className={styles.backButton}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825Z"
                fill="white"
              />
            </svg>
          </button>

          <h1 className={styles.title}>
            {streamData?.title || streamData?.name || "ACT TITLE"}
          </h1>

          <div className={styles.timer}>
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.50002 1.41699C12.4121 1.41699 15.5834 4.5882 15.5834 8.50033C15.5834 12.4124 12.4121 15.5837 8.50002 15.5837C4.5879 15.5837 1.41669 12.4124 1.41669 8.50033C1.41669 4.5882 4.5879 1.41699 8.50002 1.41699ZM8.50002 4.25033C8.31216 4.25033 8.13199 4.32495 7.99915 4.45779C7.86631 4.59063 7.79169 4.7708 7.79169 4.95866V8.50033C7.79173 8.68817 7.86638 8.86831 7.99923 9.00112L10.1242 11.1261C10.2578 11.2551 10.4367 11.3265 10.6225 11.3249C10.8082 11.3233 10.9859 11.2488 11.1172 11.1175C11.2485 10.9862 11.323 10.8085 11.3246 10.6228C11.3262 10.4371 11.2548 10.2581 11.1258 10.1245L9.20835 8.20708V4.95866C9.20835 4.7708 9.13373 4.59063 9.00089 4.45779C8.86805 4.32495 8.68788 4.25033 8.50002 4.25033Z"
                fill="white"
              />
            </svg>
            {Math.floor(streamDuration / 60)}:
            {String(streamDuration % 60).padStart(2, "0")}
          </div>
        </div>

        {/* Локация */}
        <div className={styles.location}>
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.97723 15.6786C7.97723 15.6786 2.83331 11.3464 2.83331 7.08366C2.83331 5.58077 3.43034 4.13943 4.49304 3.07672C5.55575 2.01401 6.99709 1.41699 8.49998 1.41699C10.0029 1.41699 11.4442 2.01401 12.5069 3.07672C13.5696 4.13943 14.1666 5.58077 14.1666 7.08366C14.1666 11.3464 9.02273 15.6786 9.02273 15.6786C8.73656 15.9421 8.26552 15.9392 7.97723 15.6786ZM8.49998 9.56283C8.82555 9.56283 9.14793 9.4987 9.44872 9.37411C9.7495 9.24952 10.0228 9.06691 10.253 8.83669C10.4832 8.60648 10.6658 8.33318 10.7904 8.03239C10.915 7.73161 10.9791 7.40923 10.9791 7.08366C10.9791 6.75809 10.915 6.43571 10.7904 6.13492C10.6658 5.83414 10.4832 5.56084 10.253 5.33062C10.0228 5.10041 9.7495 4.9178 9.44872 4.79321C9.14793 4.66862 8.82555 4.60449 8.49998 4.60449C7.84246 4.60449 7.21188 4.86569 6.74694 5.33062C6.28201 5.79556 6.02081 6.42614 6.02081 7.08366C6.02081 7.74117 6.28201 8.37176 6.74694 8.83669C7.21188 9.30163 7.84246 9.56283 8.49998 9.56283Z"
              fill="white"
            />
          </svg>
          <span className={styles.locationText}>
            {streamData?.location || "Santa Cruz, Argentina"}
          </span>
        </div>

        {/* Навигационная строка ролей */}
        {(streamData?.navigator ||
          streamData?.hero ||
          streamData?.initiator) && (
          <div className={styles.rolesNavigation}>
            {streamData?.navigator && (
              <span>Navigator: {streamData.navigator}</span>
            )}
            {streamData?.navigator && streamData?.hero && (
              <span className={styles.roleSeparator}>;</span>
            )}
            {streamData?.hero && <span>Hero: {streamData.hero}</span>}
            {streamData?.hero && streamData?.initiator && (
              <span className={styles.roleSeparator}>;</span>
            )}
            {streamData?.initiator && (
              <span>Initiator: {streamData.initiator}</span>
            )}
          </div>
        )}
      </div>

      {/* Полноэкранное видео */}
      <div className={styles.videoContainer}>
        <div ref={remoteVideoRef} className={styles.videoElement} />
      </div>

      {/* Статус панель (внизу экрана) */}
      <div className={styles.statusPanel}>
        <div className={styles.statusRow}>
          <div>
            <span
              className={`${styles.statusBadge} ${isConnected ? styles.statusLive : styles.statusOffline}`}
            >
              {isConnected ? "🟢 LIVE" : "🔴 OFFLINE"}
            </span>
          </div>
          <div className={styles.viewersCount}>
            👥 {remoteUsers.length} streaming
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamViewer;
