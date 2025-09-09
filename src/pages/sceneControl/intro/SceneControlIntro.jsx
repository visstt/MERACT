import { useState } from "react";

import styles from "./SceneControl.module.css";

export default function SceneControlMusic() {
  const [heroMethod, setHeroMethod] = useState("Intro");

  const handleGoBack = () => {
    window.history.back();
  };
  return (
    <div>
      <div className={styles.glass}>
        <div className={styles.header}>
          <div className={styles.name}>
            <img
              src="/icons/back_arrowV2.svg"
              alt="back_arrow"
              style={{ cursor: "pointer" }}
              onClick={handleGoBack}
            />
            <h1>Scene Control</h1>
          </div>
        </div>
        <div className="stripe2"></div>
        <div className={styles.content}>
          <img
            src="/images/samplePhoto.png"
            alt=""
            className={styles.samplePhoto}
          />
          <div className={styles.btnRow}>
            <button
              type="button"
              className={
                heroMethod === "Intro"
                  ? `${styles.selectBtn} ${styles.selectBtnActive}`
                  : styles.selectBtn
              }
              onClick={() => setHeroMethod("Intro")}
            >
              <img src="/icons/intro.svg" alt="voting" />
              Intro
            </button>
            <button
              type="button"
              className={
                heroMethod === "Transition"
                  ? `${styles.selectBtn} ${styles.selectBtnActive}`
                  : styles.selectBtn
              }
              style={{ paddingBottom: "7px" }}
              onClick={() => setHeroMethod("Transition")}
            >
              <img src="/icons/flash.svg" alt="voting" />
              Transition
            </button>
            <button
              type="button"
              className={
                heroMethod === "Music"
                  ? `${styles.selectBtn} ${styles.selectBtnActive}`
                  : styles.selectBtn
              }
              onClick={() => setHeroMethod("Music")}
            >
              <img src="/icons/music.svg" alt="voting" />
              Music
            </button>
            <button
              type="button"
              className={
                heroMethod === "Outro"
                  ? `${styles.selectBtn} ${styles.selectBtnActive}`
                  : styles.selectBtn
              }
              onClick={() => setHeroMethod("Outro")}
            >
              <img src="/icons/outro.svg" alt="voting" />
              Outro
            </button>
          </div>

          <div className={styles.wrapper}>
            <div className={styles.wrapper_header}>
              <p>Intro</p>
              <button>Upload</button>
            </div>
            <div className={styles.wrapper_content}>
              <img
                src="/images/samplePhoto.png"
                alt="samplePhoto"
                className={styles.wrapperContentImg}
              />
              <img
                src="/images/samplePhoto.png"
                alt="samplePhoto"
                className={styles.wrapperContentImg}
              />
              <img
                src="/images/samplePhoto.png"
                alt="samplePhoto"
                className={styles.wrapperContentImg}
              />
              <img
                src="/images/samplePhoto.png"
                alt="samplePhoto"
                className={styles.wrapperContentImg}
              />
              <img
                src="/images/samplePhoto.png"
                alt="samplePhoto"
                className={styles.wrapperContentImg}
              />
              <img
                src="/images/samplePhoto.png"
                alt="samplePhoto"
                className={styles.wrapperContentImg}
              />
              <img
                src="/images/samplePhoto.png"
                alt="samplePhoto"
                className={styles.wrapperContentImg}
              />
              <img
                src="/images/samplePhoto.png"
                alt="samplePhoto"
                className={styles.wrapperContentImg}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
