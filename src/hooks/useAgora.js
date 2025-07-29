import { useState } from "react";

import AgoraRTC from "agora-rtc-sdk-ng";

import { agoraConfig } from "../config/agora.js";

export const useAgora = () => {
  const [client] = useState(() =>
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }),
  );
  const [viewerClient, setViewerClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  // Создать превью камеры без подключения к каналу
  const createCameraPreview = async () => {
    try {
      if (localVideoTrack) {
        console.log("Camera preview already exists");
        return localVideoTrack;
      }

      console.log("Creating camera preview...");
      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks({
          // Улучшаем качество для избежания warnings
          videoConfig: {
            width: 1280,
            height: 720,
            frameRate: 30,
            bitrateMin: 1000,
            bitrateMax: 3000,
          },
          audioConfig: {
            sampleRate: 48000,
            stereo: true,
            bitrate: 128,
          },
        });

      console.log("Tracks created:", {
        videoTrack: videoTrack.trackMediaType,
        audioTrack: audioTrack.trackMediaType,
      });

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      console.log("Camera preview created successfully, returning videoTrack");
      return videoTrack;
    } catch (error) {
      console.error("Error creating camera preview:", error);
      throw error;
    }
  };

  // Остановить превью камеры
  const stopCameraPreview = () => {
    console.log("Stopping camera preview...");
    if (localVideoTrack) {
      try {
        localVideoTrack.stop();
        localVideoTrack.close();
      } catch (error) {
        console.warn("Error stopping video track:", error);
      }
      setLocalVideoTrack(null);
    }
    if (localAudioTrack) {
      try {
        localAudioTrack.stop();
        localAudioTrack.close();
      } catch (error) {
        console.warn("Error stopping audio track:", error);
      }
      setLocalAudioTrack(null);
    }
    console.log("Camera preview stopped");
  };
  const joinAsPublisher = async (token, channelName, uid = null) => {
    try {
      if (!agoraConfig.appId || agoraConfig.appId === "your-agora-app-id") {
        throw new Error(
          "Agora App ID не настроен. Проверьте переменную VITE_AGORA_APP_ID в .env файле",
        );
      }

      if (!token || token === "null") {
        throw new Error("Токен не предоставлен или равен null");
      }

      console.log(
        `Joining as publisher with token: ${token}, channelName: ${channelName}, uid: ${uid}`,
      );

      console.log("Agora config:", {
        appId: agoraConfig.appId,
        tokenLength: token.length,
        channelNameLength: channelName.length,
      });

      const numericUid = uid ? parseInt(uid, 10) : null;
      console.log(`Using UID: ${uid} -> ${numericUid}`);

      console.log("Joining channel with:", {
        appId: agoraConfig.appId,
        channelName,
        tokenLength: token.length,
        uid: numericUid,
      });

      await client.join(agoraConfig.appId, channelName, token, numericUid);
      setIsJoined(true);

      // Используем существующие треки если они есть, иначе создаем новые
      let videoTrack = localVideoTrack;
      let audioTrack = localAudioTrack;

      if (!videoTrack || !audioTrack) {
        console.log("Creating new camera and microphone tracks for publishing");
        const [newAudioTrack, newVideoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks({
            // Улучшаем качество для избежания warnings
            videoConfig: {
              width: 1280,
              height: 720,
              frameRate: 30,
              bitrateMin: 1000,
              bitrateMax: 3000,
            },
            audioConfig: {
              sampleRate: 48000,
              stereo: true,
              bitrate: 128,
            },
          });

        if (!videoTrack) {
          videoTrack = newVideoTrack;
          setLocalVideoTrack(videoTrack);
        } else {
          newVideoTrack.close(); // Закрываем ненужный трек
        }

        if (!audioTrack) {
          audioTrack = newAudioTrack;
          setLocalAudioTrack(audioTrack);
        } else {
          newAudioTrack.close(); // Закрываем ненужный трек
        }
      } else {
        console.log(
          "Using existing camera and microphone tracks for publishing",
        );
      }

      // Убеждаемся что треки активны
      if (videoTrack && !videoTrack.enabled) {
        console.log("Enabling video track before publishing");
        await videoTrack.setEnabled(true);
      }

      if (audioTrack && !audioTrack.enabled) {
        console.log("Enabling audio track before publishing");
        await audioTrack.setEnabled(true);
      }

      console.log("Publishing tracks:", {
        videoEnabled: videoTrack?.enabled,
        audioEnabled: audioTrack?.enabled,
        videoMuted: videoTrack?.muted,
        audioMuted: audioTrack?.muted,
      });

      await client.publish([videoTrack, audioTrack]);
      setIsPublishing(true);

      console.log("Published successfully");
      console.log("Publisher client info:", {
        connectionState: client.connectionState,
        localUid: client.uid,
        channelName: client.channelName,
        remoteUsers: client.remoteUsers?.length || 0,
      });

      return { videoTrack, audioTrack };
    } catch (error) {
      console.error("Agora-SDK [ERROR]:", error);
      throw error;
    }
  };

  // Присоединиться к каналу как viewer (зритель)
  const joinAsViewer = async (token, channelName, uid = null) => {
    try {
      if (!agoraConfig.appId || agoraConfig.appId === "your-agora-app-id") {
        throw new Error("Agora App ID не настроен");
      }

      // Создаем отдельный клиент для зрителя, чтобы не мешать стримеру
      let currentViewerClient = viewerClient;
      if (!currentViewerClient) {
        console.log("Creating new viewer client");
        currentViewerClient = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });
        setViewerClient(currentViewerClient);
      }

      // Если токен предоставлен, используем переданный UID
      // Важно: используем точный UID который генерирует сервер
      const viewerUid = token ? uid : null;

      console.log("Joining as viewer:", {
        appId: agoraConfig.appId,
        channelName,
        uid: viewerUid,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
      });

      console.log("Viewer client state before join:", {
        connectionState: currentViewerClient.connectionState,
        localUid: currentViewerClient.uid,
      });

      // Проверяем, не подключены ли мы уже
      if (currentViewerClient.connectionState === "CONNECTED") {
        console.log("Viewer client already connected, leaving first");
        await currentViewerClient.leave();
        // Ждем немного для полного отключения
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else if (currentViewerClient.connectionState === "CONNECTING") {
        console.log(
          "Viewer client is connecting, waiting for completion or timeout",
        );
        // Ждем короткое время, чтобы подключение завершилось или отменилось
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Если все еще подключается, принудительно отключаемся
        if (currentViewerClient.connectionState === "CONNECTING") {
          console.log("Still connecting after timeout, forcing leave");
          await currentViewerClient.leave();
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Дополнительная проверка после ожидания
      if (currentViewerClient.connectionState !== "DISCONNECTED") {
        console.log(
          "Viewer client still not disconnected, forcing clean state",
        );
        await currentViewerClient.leave();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await currentViewerClient.join(
        agoraConfig.appId,
        channelName,
        token,
        viewerUid,
      );
      setIsJoined(true);

      console.log("Successfully joined as viewer:", {
        connectionState: currentViewerClient.connectionState,
        localUid: viewerUid,
        channelName,
      });

      return currentViewerClient;
    } catch (error) {
      console.error("Error joining as viewer:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
      });

      // Сбрасываем состояние при ошибке
      setIsJoined(false);
      throw error;
    }
  };

  // Покинуть канал
  const leave = async () => {
    try {
      console.log("Leaving channel, current state:", {
        connectionState: client.connectionState,
        isJoined,
        localUid: client.uid,
      });

      // Остановить и закрыть локальные треки
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }

      // Отключиться от канала только если подключены
      if (
        client.connectionState === "CONNECTED" ||
        client.connectionState === "CONNECTING"
      ) {
        await client.leave();
        console.log("Successfully left the channel");
      } else {
        console.log("Client not connected, skipping leave");
      }

      setIsJoined(false);
      setIsPublishing(false);
    } catch (error) {
      console.error("Error leaving channel:", error);

      // Сбрасываем состояние даже если произошла ошибка
      setIsJoined(false);
      setIsPublishing(false);
      setLocalVideoTrack(null);
      setLocalAudioTrack(null);

      // Не пробрасываем ошибку, чтобы не блокировать cleanup
      console.warn("Leave completed with errors, but state reset");
    }
  };

  // Воспроизвести видео в элементе
  const playVideo = (track, element) => {
    if (track && element) {
      track.play(element);
    }
  };

  return {
    client,
    viewerClient,
    localVideoTrack,
    localAudioTrack,
    isPublishing,
    isJoined,
    joinAsPublisher,
    joinAsViewer,
    leave,
    playVideo,
    createCameraPreview,
    stopCameraPreview,
  };
};
