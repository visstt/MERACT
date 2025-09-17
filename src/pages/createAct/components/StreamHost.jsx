import React, { useEffect, useRef, useState } from "react";

import api from "../../../shared/api/api";

// Заглушки для Agora (установите agora-rtc-sdk-ng если нужно)
// import AgoraRTC from 'agora-rtc-sdk-ng';

const StreamHost = ({ actId, actTitle, onStopStream }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const localVideoRef = useRef(null);
  // const clientRef = useRef(null); // Закомментировано для будущего использования с Agora
  // const localTracksRef = useRef({}); // Закомментировано для будущего использования с Agora

  // Генерируем channel ID на основе actId
  const channelName = `act_${actId}`;

  useEffect(() => {
    // Получаем токен для стрима
    const getStreamToken = async () => {
      try {
        console.log("Getting stream token for channel:", channelName);

        // Получаем токен с вашего бэкенда для publisher (стример)
        const response = await api.get(
          `/act/token/${channelName}/publisher/uid/0?expiry=3600`,
        );
        setToken(response.data.token);

        console.log("Token received:", response.data.token);
      } catch (err) {
        console.error("Error getting stream token:", err);
        setError("Failed to get stream token");
      }
    };

    getStreamToken();

    // Cleanup при размонтировании
    return () => {
      if (isStreaming) {
        stopStreaming();
      }
    };
  }, [actId, channelName]); // eslint-disable-line react-hooks/exhaustive-deps

  const startStreaming = async () => {
    if (!token) {
      setError("No token available");
      return;
    }

    try {
      setIsStreaming(true);
      setError(null);

      console.log("Starting stream for act:", actId, "channel:", channelName);

      // ЗДЕСЬ ДОЛЖНА БЫТЬ ИНТЕГРАЦИЯ С AGORA
      // Пока что это заглушка

      /* 
      Пример интеграции с Agora:
      
      // Создаем клиент
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;
      
      // Подключаемся к каналу
      await client.join(
        process.env.REACT_APP_AGORA_APP_ID,
        channelName,
        token,
        0 // uid
      );
      
      // Создаем треки
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      localTracksRef.current = { audioTrack, videoTrack };
      
      // Публикуем треки
      await client.publish([audioTrack, videoTrack]);
      
      // Воспроизводим локальное видео
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }
      */

      // Заглушка для демонстрации
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = `
          <div style="
            width: 100%; 
            height: 100%; 
            background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            text-align: center;
          ">
            🎥 LIVE STREAMING<br/>
            Act: ${actTitle}<br/>
            Channel: ${channelName}
          </div>
        `;
      }

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

      // ЗДЕСЬ ДОЛЖНА БЫТЬ ЛОГИКА ОСТАНОВКИ AGORA

      /*
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
      */

      // Очищаем видео
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = "";
      }

      setIsStreaming(false);

      // Уведомляем родительский компонент
      if (onStopStream) {
        onStopStream();
      }

      console.log("Stream stopped successfully");
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
          <strong>Status:</strong> {isStreaming ? "🔴 LIVE" : "⚫ OFFLINE"}
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
        <div ref={localVideoRef} style={{ width: "100%", height: "100%" }} />
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
            🎥 Start Streaming
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
            ⏹️ Stop Stream
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          color: "#666",
          fontSize: "14px",
        }}
      >
        <p>
          <strong>Note:</strong> This is a demo implementation. To enable real
          streaming, install agora-rtc-sdk-ng and implement the Agora
          integration.
        </p>
      </div>
    </div>
  );
};

export default StreamHost;
