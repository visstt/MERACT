import React, { useEffect, useRef, useState } from "react";

import AgoraRTC from "agora-rtc-sdk-ng";

import api from "../../../shared/api/api";
import { useAuthStore } from "../../../shared/stores/authStore";
import styles from "./StreamHost.module.css";

// Function to extract data from JWT token
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
  const isInitializingRef = useRef(false); // Flag to prevent multiple initialization
  const isStreamingStartedRef = useRef(false); // Flag to prevent multiple stream start

  // Get user from auth store
  const { user } = useAuthStore();

  // Extract user ID (use user.id first, then from token)
  let baseUserId;
  if (user?.id) {
    baseUserId = user.id;
  } else if (user?.token) {
    const tokenData = parseJWT(user.token);
    baseUserId = tokenData?.sub || tokenData?.id || 999999;
  } else {
    baseUserId = 999999; // Fixed fallback
  }

  // Create unique UID for streamer: actId + userId + role
  const userId = parseInt(`${actId}${baseUserId}2`); // actId + userId + role(2=publisher)

  console.log(
    "StreamHost user data:",
    user,
    "baseUserId:",
    baseUserId,
    "userId:",
    userId,
  );

  // Generate channel ID based on actId
  const channelName = `act_${actId}`;

  useEffect(() => {
    document.body.classList.add("no-overlay");
    return () => {
      document.body.classList.remove("no-overlay");
    };
  }, []);

  useEffect(() => {
    // Get token for stream
    const getStreamToken = async () => {
      // Prevent multiple initialization
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

        // Get token from your backend for publisher (streamer)
        const response = await api.get(
          `/act/token/${channelName}/PUBLISHER/uid?uid=${userId}&expiry=3600`,
        );
        setToken(response.data.token);

        console.log("Token received:", response.data.token);

        // Automatically start stream only once
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

    // Cleanup on unmount
    return () => {
      isInitializingRef.current = false;
      isStreamingStartedRef.current = false;
      if (isStreaming) {
        stopStreaming();
      }
      stopCameraPreview();
    };
  }, [actId, channelName, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to start camera preview
  const startCameraPreview = async () => {
    try {
      console.log("Starting camera preview...");

      // Check permissions and create preview
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log("Camera preview started successfully");
      }

      // Save stream for later stopping
      localTracksRef.current.previewStream = stream;
    } catch (err) {
      console.error("Error starting camera preview:", err);
      setError("Failed to access camera: " + err.message);
    }
  };

  // Function to stop camera preview
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

      // Stop camera preview
      stopCameraPreview();

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      console.log("Agora client created, joining channel...");

      // Join channel
      await client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        channelName,
        token,
        userId, // user uid from auth store
      );

      console.log("Joined channel successfully");

      // Create tracks
      console.log("Creating camera and microphone tracks...");
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();

      localTracksRef.current = { audioTrack, videoTrack };

      // Play local video
      if (localVideoRef.current) {
        console.log("Playing local video...");
        videoTrack.play(localVideoRef.current);
      }

      // Publish tracks
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

      // Stop and close tracks
      if (localTracksRef.current.audioTrack) {
        localTracksRef.current.audioTrack.stop();
        localTracksRef.current.audioTrack.close();
      }
      if (localTracksRef.current.videoTrack) {
        localTracksRef.current.videoTrack.stop();
        localTracksRef.current.videoTrack.close();
      }

      // Leave channel
      if (clientRef.current) {
        await clientRef.current.leave();
      }

      // Clear references
      localTracksRef.current = {};
      clientRef.current = null;

      setIsStreaming(false);

      // Notify parent component
      if (onStopStream) {
        onStopStream();
      }

      console.log("Stream stopped successfully");

      // Camera and microphone are now fully stopped; do not start preview again
    } catch (err) {
      console.error("Error stopping stream:", err);
      setError("Failed to stop stream: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoBox}>
        <p>
          <strong>Status:</strong>{" "}
          {isStreaming ? (
            <span className={styles.statusLive}>🔴 LIVE</span>
          ) : (
            <span className={styles.statusPreparing}>⚪ OFFLINE</span>
          )}
        </p>
      </div>
      <div className={styles.videoContainer}>
        <div ref={localVideoRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className={styles.controls}>
        <button
          className={styles.button}
          onClick={isStreaming ? stopStreaming : startStreaming}
          disabled={isInitializingRef.current}
        >
          {isStreaming ? "Stop Stream" : "Start Stream"}
        </button>
        <button
          className={styles.button}
          onClick={onStopStream}
          disabled={isStreaming}
        >
          Exit
        </button>
      </div>

      <div className={styles.infoText}>
        <p>
          {isStreaming
            ? "Your camera and microphone are now live!"
            : 'Click "Start Stream" to go live. Make sure your camera and microphone are connected.'}
        </p>
      </div>
    </div>
  );
};

export default StreamHost;
