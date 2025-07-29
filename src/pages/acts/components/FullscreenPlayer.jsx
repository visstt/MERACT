import { useCallback, useEffect, useRef, useState } from "react";

import { useAgora } from "../../../hooks/useAgora.js";
import { joinStream } from "../../../services/streamApi.js";
import styles from "./FullscreenPlayer.module.css";

export default function FullscreenPlayer({ streamData, onClose }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { viewerClient, joinAsViewer, leave, playVideo } = useAgora();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionAttemptRef = useRef(false);
  const cleanupRef = useRef(false);

  const handleClose = useCallback(async () => {
    if (cleanupRef.current) {
      return; // Уже выполняем cleanup
    }

    cleanupRef.current = true;

    try {
      if (isConnected) {
        await leave();
        setIsConnected(false);
      }

      // Выходим из полноэкранного режима
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      onClose();
    } catch (error) {
      console.error("Error closing fullscreen player:", error);
      onClose();
    }
  }, [isConnected, leave, onClose]);

  useEffect(() => {
    const connectToStream = async () => {
      // Защита от двойного выполнения (React StrictMode)
      if (connectionAttemptRef.current) {
        console.log("Connection already in progress, skipping...");
        return;
      }

      if (!streamData?.streamId) {
        setError("Stream data is not available");
        setIsLoading(false);
        return;
      }

      connectionAttemptRef.current = true;

      try {
        setIsLoading(true);
        setError(null);

        console.log("Connecting to stream:", streamData.streamId);

        // Получаем токен для подключения к стриму
        const response = await joinStream(streamData.streamId);

        console.log("Join stream response:", response);

        if (!response.token) {
          throw new Error("Failed to get stream token");
        }

        // Используем userId из ответа сервера для подключения
        const uid = response.userId;
        console.log("Using UID for viewer connection:", uid);

        // Убеждаемся что клиент полностью отключен перед подключением
        if (
          viewerClient?.connectionState === "CONNECTED" ||
          viewerClient?.connectionState === "CONNECTING"
        ) {
          console.log(
            "ViewerClient already connected/connecting, leaving first",
          );
          await leave();
          // Ждем полного отключения
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Подключаемся как зритель с точным UID и получаем viewerClient
        const connectedViewerClient = await joinAsViewer(
          response.token,
          response.streamName,
          uid,
        );
        setIsConnected(true);

        console.log("Successfully connected to stream as viewer");

        // Добавим обработчики для всех событий пользователей на viewerClient
        connectedViewerClient.on("user-joined", (user) => {
          console.log("User joined:", user.uid, user);
          console.log("User details:", {
            uid: user.uid,
            hasVideo: user.hasVideo,
            hasAudio: user.hasAudio,
            videoEnabled: user._video_enabled_,
            audioEnabled: user._audio_enabled_,
            videoMuted: user._video_muted_,
            audioMuted: user._audio_muted_,
          });
        });

        connectedViewerClient.on("user-left", (user) => {
          console.log("User left:", user.uid);
        });

        // Слушаем удаленные треки
        connectedViewerClient.on("user-published", async (user, mediaType) => {
          console.log("User published:", user.uid, mediaType);
          console.log("User details:", user);

          try {
            await connectedViewerClient.subscribe(user, mediaType);
            console.log(
              "Successfully subscribed to user:",
              user.uid,
              mediaType,
            );

            if (mediaType === "video" && videoRef.current) {
              console.log("Playing remote video from user:", user.uid);
              console.log("Video track:", user.videoTrack);
              playVideo(user.videoTrack, videoRef.current);
            }
          } catch (error) {
            console.error("Error subscribing to user:", error);
          }
        });

        connectedViewerClient.on("user-unpublished", (user, mediaType) => {
          console.log("User unpublished:", user.uid, mediaType);
        });

        // Добавим дополнительные обработчики для отладки
        connectedViewerClient.on("stream-message", (uid, data) => {
          console.log("Stream message from:", uid, data);
        });

        connectedViewerClient.on(
          "connection-state-change",
          (curState, revState, reason) => {
            console.log(
              "Connection state change:",
              curState,
              "from:",
              revState,
              "reason:",
              reason,
            );
          },
        );

        connectedViewerClient.on("network-quality", (stats) => {
          console.log("Network quality:", stats);
        });

        // Добавим еще больше событий для диагностики
        connectedViewerClient.on("user-info-updated", (uid, msg) => {
          console.log("User info updated:", uid, msg);
        });

        connectedViewerClient.on("token-privilege-will-expire", () => {
          console.log("Token privilege will expire");
        });

        connectedViewerClient.on("token-privilege-did-expire", () => {
          console.log("Token privilege did expire");
        });

        // Добавим обработчик для проверки уже подключенных пользователей
        const remoteUsers = connectedViewerClient.remoteUsers;
        console.log("Remote users already in channel:", remoteUsers);

        // Если есть пользователи с опубликованными треками, подписываемся на них
        for (const user of remoteUsers) {
          console.log("Checking user:", user.uid, {
            hasVideo: user.hasVideo,
            hasAudio: user.hasAudio,
            videoEnabled: user._video_enabled_,
            audioEnabled: user._audio_enabled_,
            videoMuted: user._video_muted_,
            audioMuted: user._audio_muted_,
          });

          if (user.hasVideo) {
            console.log(
              "Found existing user with video, subscribing:",
              user.uid,
            );
            try {
              await connectedViewerClient.subscribe(user, "video");
              if (videoRef.current) {
                playVideo(user.videoTrack, videoRef.current);
              }
            } catch (error) {
              console.error("Error subscribing to existing user video:", error);
            }
          }
          if (user.hasAudio) {
            console.log(
              "Found existing user with audio, subscribing:",
              user.uid,
            );
            try {
              await connectedViewerClient.subscribe(user, "audio");
            } catch (error) {
              console.error("Error subscribing to existing user audio:", error);
            }
          }
        }

        setIsLoading(false);

        // Удаляем ранее добавленный код для интервала - его будет в отдельном useEffect
      } catch (error) {
        console.error("Failed to connect to stream:", error);

        // Специальная обработка UID конфликта
        if (error.code === "UID_CONFLICT") {
          console.log(
            "UID conflict detected, trying to force disconnect and reconnect...",
          );
          try {
            // Полностью отключаемся
            await leave();
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setError("Reconnecting due to UID conflict...");
            // Не пробуем переподключиться автоматически, пользователь может попробовать снова
          } catch (retryError) {
            console.error("Cleanup after UID conflict failed:", retryError);
            setError(`Connection failed: ${error.message}. Please try again.`);
          }
        } else {
          setError(`Failed to connect: ${error.message}`);
        }
        setIsLoading(false);
      } finally {
        // Сбрасываем флаг после завершения
        connectionAttemptRef.current = false;
      }
    };

    connectToStream();

    // Cleanup при размонтировании
    return () => {
      handleClose();
    };
  }, [
    streamData?.streamId,
    viewerClient,
    handleClose,
    joinAsViewer,
    playVideo,
    leave,
  ]);

  // Периодическая проверка удаленных пользователей для отладки
  useEffect(() => {
    if (!isConnected || !viewerClient) return;

    const checkRemoteUsers = () => {
      const users = viewerClient.remoteUsers || [];
      console.log("=== PERIODIC CHECK ===");
      console.log(`Remote users count: ${users.length}`);
      console.log(
        `ViewerClient connection state: ${viewerClient.connectionState}`,
      );

      users.forEach((user) => {
        console.log(`User ${user.uid}:`, {
          hasVideo: user.hasVideo,
          hasAudio: user.hasAudio,
          videoTrack: !!user.videoTrack,
          audioTrack: !!user.audioTrack,
          videoEnabled: user._video_enabled_,
          audioEnabled: user._audio_enabled_,
          videoMuted: user._video_muted_,
          audioMuted: user._audio_muted_,
        });
      });
      console.log("=== END CHECK ===");
    };

    // Проверяем каждые 5 секунд для более активного мониторинга
    const intervalId = setInterval(checkRemoteUsers, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isConnected, viewerClient]);

  const enterFullscreen = () => {
    if (containerRef.current) {
      const element = containerRef.current;

      // Попробуем различные методы входа в полноэкранный режим
      const requestFullscreen =
        element.requestFullscreen ||
        element.webkitRequestFullscreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(element).catch((error) => {
          console.warn("Could not enter fullscreen mode:", error);
          // Для мобильных устройств может не поддерживаться API полноэкранного режима
          // Но компонент все равно будет работать как overlay
        });
      } else {
        console.warn("Fullscreen API not supported on this device");
      }
    }
  };

  // Автоматически входим в полноэкранный режим при монтировании
  useEffect(() => {
    const timer = setTimeout(() => {
      enterFullscreen();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Обработка выхода из полноэкранного режима
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleClose();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, [handleClose]);

  return (
    <div ref={containerRef} className={styles.fullscreenContainer}>
      {/* Кнопка закрытия */}
      <button className={styles.closeButton} onClick={handleClose}>
        ✕
      </button>

      {/* Информация о стриме */}
      <div className={styles.streamInfo}>
        <h2>{streamData?.streamName || "Live Stream"}</h2>
        <span className={styles.liveIndicator}>● LIVE</span>
      </div>

      {/* Видео контейнер */}
      <div className={styles.videoContainer}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Connecting to stream...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorOverlay}>
            <p>Error: {error}</p>
            <button onClick={handleClose}>Close</button>
          </div>
        )}

        <div ref={videoRef} className={styles.remoteVideo}></div>

        {!isLoading && !error && !isConnected && (
          <div className={styles.loadingOverlay}>
            <p>Connecting...</p>
          </div>
        )}
      </div>

      {/* Элементы управления */}
      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <button className={styles.controlButton}>👍</button>
          <button className={styles.controlButton}>👎</button>
        </div>

        <div className={styles.rightControls}>
          <button className={styles.controlButton}>💬</button>
          <button className={styles.controlButton}>❤️</button>
        </div>
      </div>
    </div>
  );
}
