import React from "react";

import { useNavigate, useParams } from "react-router-dom";

import StreamHost from "../createAct/components/StreamHost";
import styles from "./StreamHostPage.module.css";

const StreamHostPage = () => {
  const { id } = useParams(); // Получаем ID акта из URL
  const navigate = useNavigate();

  const handleStopStream = () => {
    // После остановки стрима возвращаемся на главную страницу
    navigate("/acts");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate("/acts")}>
          ← Back to Acts
        </button>
        <h1 className={styles.title}>Live Streaming</h1>
      </div>

      <div className={styles.streamContent}>
        <StreamHost
          actId={id}
          actTitle={`Act ${id}`}
          onStopStream={handleStopStream}
        />
      </div>
    </div>
  );
};

export default StreamHostPage;
