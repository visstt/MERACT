import React, { useEffect, useRef, useState } from "react";

import api from "../../../shared/api/api";

const StreamViewer = ({ channelName, streamData, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const remoteVideoRef = useRef(null);
  // const clientRef = useRef(null); // Для будущего использования с Agora

  // Используем переданный channelName напрямую
  const actualChannelName = channelName || `act_${streamData?.id || "default"}`;

  useEffect(() => {
    // Получаем токен для просмотра
    const getViewerToken = async () => {
      try {
        console.log("Getting viewer token for channel:", actualChannelName);

        // Получаем токен с вашего бэкенда для subscriber (зритель)
        const response = await api.get(
          `/act/token/${actualChannelName}/SUBSCRIBER/uid?uid=2&expiry=3600`,
        );
        setToken(response.data.token);

        console.log("Viewer token received:", response.data.token);

        // Автоматически подключаемся после получения токена
        connectToStream(response.data.token);
      } catch (err) {
        console.error("Error getting viewer token:", err);
        setError("Failed to get viewer token");
      }
    };

    getViewerToken();

    // Cleanup при размонтировании
    return () => {
      if (isConnected) {
        disconnectFromStream();
      }
    };
  }, [streamData?.id, actualChannelName]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectToStream = async (streamToken) => {
    if (!streamToken) {
      setError("No token available");
      return;
    }

    try {
      setIsConnected(true);
      setError(null);

      console.log(
        "Connecting to stream for act:",
        streamData?.id,
        "channel:",
        actualChannelName,
      );

      // ЗДЕСЬ ДОЛЖНА БЫТЬ ИНТЕГРАЦИЯ С AGORA ДЛЯ ПОДКЛЮЧЕНИЯ ЗРИТЕЛЯ
      // Пока что это заглушка

      /* 
      Пример интеграции с Agora для зрителя:
      
      // Создаем клиент
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;
      
      // Подключаемся к каналу как зритель
      await client.join(
        process.env.REACT_APP_AGORA_APP_ID,
        channelName,
        streamToken,
        0 // uid
      );
      
      // Слушаем события пользователей
      client.on('user-published', async (user, mediaType) => {
        console.log('User published:', user.uid, mediaType);
        
        // Подписываемся на пользователя
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
        
        setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
      });
      
      client.on('user-unpublished', (user) => {
        console.log('User unpublished:', user.uid);
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });
      */

      // Заглушка для демонстрации
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = `
          <div style="
            width: 100%; 
            height: 100%; 
            background: linear-gradient(45deg, #4CAF50 0%, #45a049 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            text-align: center;
          ">
            👀 WATCHING STREAM<br/>
            Act: ${streamData?.title || streamData?.name || "Unknown"}<br/>
            Channel: ${actualChannelName}<br/>
            <small style="font-size: 14px;">Demo mode - no real video stream</small>
          </div>
        `;
      }

      // Имитируем получение удаленного пользователя
      setRemoteUsers([{ uid: "demo_streamer", username: "Streamer" }]);

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

      // ЗДЕСЬ ДОЛЖНА БЫТЬ ЛОГИКА ОТКЛЮЧЕНИЯ AGORA

      /*
      // Покидаем канал
      if (clientRef.current) {
        await clientRef.current.leave();
      }
      */

      // Очищаем видео
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = "";
      }

      setIsConnected(false);
      setRemoteUsers([]);

      console.log("Disconnected from stream successfully");
    } catch (err) {
      console.error("Error disconnecting from stream:", err);
      setError("Failed to disconnect from stream: " + err.message);
    }
  };

  const handleClose = () => {
    disconnectFromStream();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>
          👀 Watching:{" "}
          {streamData?.title || streamData?.name || "Unknown Stream"}
        </h2>
        <button
          onClick={handleClose}
          style={{
            background: "#f44336",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ✕ Close
        </button>
      </div>

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
          <strong>Act ID:</strong> {streamData?.id || "Unknown"}
        </p>
        <p>
          <strong>Channel:</strong> {actualChannelName}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {isConnected ? "🟢 CONNECTED" : "🔴 DISCONNECTED"}
        </p>
        <p>
          <strong>Token:</strong> {token ? "✅ Ready" : "❌ Loading..."}
        </p>
        <p>
          <strong>Remote Users:</strong> {remoteUsers.length}
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
        <div ref={remoteVideoRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Информация о пользователях */}
      {remoteUsers.length > 0 && (
        <div
          style={{
            background: "#e8f5e8",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <strong>Connected Users:</strong>
          <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
            {remoteUsers.map((user) => (
              <li key={user.uid}>
                User ID: {user.uid} {user.username && `(${user.username})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
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

export default StreamViewer;
