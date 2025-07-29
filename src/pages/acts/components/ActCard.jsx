import { useEffect, useRef, useState } from "react";

import { useAgora } from "../../../hooks/useAgora.js";
import styles from "./ActCard.module.css";
import FullscreenPlayer from "./FullscreenPlayer.jsx";

// Функция для получения ID текущего пользователя
const getCurrentUserId = () => {
  // Попробуем получить из localStorage или другого источника
  const userInfo = localStorage.getItem("userInfo");

  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      return parsed.id || parsed.userId;
    } catch (e) {
      console.warn("Error parsing userInfo:", e);
    }
  }

  // Fallback - попробуем извлечь из токена или других источников
  // В реальном приложении это может быть получено из контекста auth
  return null;
};

export default function ActCard({ streamData }) {
  const videoRef = useRef(null);
  const { leave } = useAgora();
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentUserId = getCurrentUserId();
  const isOwner =
    streamData?.userId && currentUserId && streamData.userId === currentUserId;

  useEffect(() => {
    // Если это владелец стрима, не подключаемся как зритель
    if (isOwner) {
      console.log("This is your own stream, skipping viewer connection");
      return;
    }

    // Не подключаемся в ActCard, только показываем превью
    // Подключение происходит только в FullscreenStream
    if (streamData && streamData.streamName && streamData.streamId) {
      console.log("Stream data available for preview:", {
        streamId: streamData.streamId,
        streamName: streamData.streamName,
        isOwner,
      });
    }

    return () => {
      // Очистка при размонтировании
      if (isConnected) {
        leave().catch(console.error);
        setIsConnected(false);
      }
    };
  }, [streamData, isOwner, isConnected, leave]);

  const handleCardClick = () => {
    if (isOwner) {
      console.log("Cannot view your own stream in fullscreen");
      // Можно показать уведомление пользователю
      alert(
        "Вы не можете просматривать собственный стрим в полноэкранном режиме",
      );
      return;
    }

    // Проверяем, что у нас есть необходимые данные для стрима
    if (!streamData || !streamData.streamId) {
      console.log("Stream data is not available");
      alert("Данные стрима недоступны");
      return;
    }

    setIsFullscreen(true);
  };

  // Если переданы данные стрима, используем их, иначе показываем mock данные
  const displayData = streamData || {
    streamName: "Voices in the Crowd",
    status: "ONLINE",
    startedAt: new Date().toISOString(),
    previewFileName: null,
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `Live ${diffHours}h ${diffMinutes}m`;
    }
    return `Live ${diffMinutes}m`;
  };

  return (
    <>
      {isFullscreen && streamData && (
        <FullscreenPlayer
          streamData={streamData}
          onClose={() => setIsFullscreen(false)}
        />
      )}

      <div className={styles.actCard} onClick={handleCardClick}>
        {/* Видео стрим */}
        {streamData && <div ref={videoRef} className={styles.videoStream} />}

        <h1>{displayData.streamName}</h1>
        <h3>
          Lorem ipsum is a dummy or placeholder text commonly used in graphic
          design, publishing
        </h3>
        <p>
          Navigator: Graphite8 ; Hero: Graphite8, NeonFox, ShadowWeave,
          EchoStorm1
        </p>

        <div className={styles.stripe}></div>
        <div className={styles.blocks}>
          <p>Puerto de la Cruz (ES)</p>
          <p>2,500km Away</p>
        </div>

        <div className={styles.info}>
          <div className={styles.arrows}>
            <span className={styles.arrow}>
              <img src="/icons/arrowUp.svg" alt="arrow" />
              <h2>12</h2>
            </span>
            <span className={styles.arrow}>
              <img src="/icons/arrowDown.svg" alt="arrow" />
              <h2>12</h2>
            </span>
          </div>

          <h4>
            {displayData.status === "ONLINE"
              ? formatTime(displayData.startedAt)
              : "Offline"}
          </h4>
        </div>

        <img
          src="/icons/link_icon.png"
          alt="link_icon"
          className={styles.linkIcon}
        />
        <img
          src="/icons/favorites_icon.png"
          alt="favorites_icon"
          className={styles.favoritesIcon}
        />
      </div>
    </>
  );
}
