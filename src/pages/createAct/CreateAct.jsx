import { useRef, useState } from "react";

import styles from "./CreateAct.module.css";

export default function CreateAct() {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [actType, setActType] = useState("single");
  const [formatType, setFormatType] = useState("single");
  const [settingsType, setSettingsType] = useState("option1");
  const [heroMethod, setHeroMethod] = useState("voting");
  const [navigatorMethod, setNavigatorMethod] = useState("voting");
  const [biddingTime, setBiddingTime] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTimeChange = (direction) => {
    if (isAnimating) return;

    let newTime;
    if (direction === "increase") {
      newTime = Math.min(20, biddingTime + 5);
    } else {
      newTime = Math.max(5, biddingTime - 5);
    }

    if (newTime === biddingTime) return; // Не анимируем если значение не изменилось

    setIsAnimating(true);
    setBiddingTime(newTime);

    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleActType = (type) => {
    setActType(type);
  };
  const handleFormatType = (type) => {
    setFormatType(type);
  };
  const handleSettingsType = (type) => {
    setSettingsType(type);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className={styles.glass}>
      <div className={styles.header}>
        <div className={styles.name}>
          <img
            src="/icons/back_arrowV2.svg"
            alt="back_arrow"
            style={{ cursor: "pointer" }}
            onClick={handleGoBack}
          />
          <h1>Create ACT</h1>
        </div>
      </div>

      <div className="stripe2"></div>
      <div className={styles.content}>
        <div className={styles.block}>
          <p>Act Title</p>
          <input
            type="text"
            placeholder="Act Title"
            className={styles.ActTitle}
          />
        </div>
        <div className={styles.block}>
          <p>Act Gallery</p>
          <div className={styles.fileRow}>
            <input
              type="text"
              readOnly
              value={" "}
              placeholder="No file chosen"
              className={styles.fileDisplay}
              style={
                imagePreview
                  ? {
                      backgroundImage: `url(${imagePreview})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      color: "#fff",
                    }
                  : undefined
              }
            />
            <button
              type="button"
              className={styles.browseBtn}
              onClick={openFileDialog}
            >
              Browse
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
            />
          </div>
        </div>
        <div className={styles.block}>
          <p>Sequel?</p>
          <div className={styles.fileRow}>
            <button type="button" className={styles.browseBtn}>
              Create Sequel
            </button>
            <button type="button" className={styles.browseBtn}>
              Add to existing
            </button>
          </div>
        </div>
        <div className={styles.block}>
          <p>Act type</p>
          <div className={styles.fileRow}>
            <button
              type="button"
              className={
                actType === "single"
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleActType("single")}
            >
              <img src="/icons/singleHero.svg" alt="" />
              Single Hero
            </button>
            <button
              type="button"
              className={
                actType === "multi"
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleActType("multi")}
            >
              <img src="/icons/multiHero.svg" alt="" />
              Multi Hero
            </button>
          </div>
        </div>
        <div className={styles.block}>
          <p>Stream format</p>
          <div className={styles.fileRow}>
            <button
              type="button"
              className={
                formatType === "single"
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleFormatType("single")}
            >
              Single
            </button>
            <button
              type="button"
              className={
                formatType === "several"
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleFormatType("several")}
            >
              Several feed
            </button>
          </div>
        </div>
        <div className={styles.block}>
          <div className={styles.fileColumn}>
            <p>Hero Selection Methods</p>
            <div className={styles.btnRow}>
              <button
                type="button"
                className={
                  heroMethod === "voting"
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                onClick={() => setHeroMethod("voting")}
              >
                <img src="/icons/voting.svg" alt="voting" />
                Voting
              </button>
              <button
                type="button"
                className={
                  heroMethod === "bidding"
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                style={{ paddingBottom: "7px" }}
                onClick={() => setHeroMethod("bidding")}
              >
                <img src="/icons/hummer.svg" alt="voting" />
                Bidding
              </button>
              <button
                type="button"
                className={
                  heroMethod === "manual"
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                onClick={() => setHeroMethod("manual")}
              >
                <img src="/icons/manual.svg" alt="voting" />
                Manual
              </button>
            </div>
          </div>
        </div>
        <div className={styles.block}>
          <div className={styles.fileColumn}>
            <p>Navigator Selection Methods</p>
            <div className={styles.btnRow}>
              <button
                type="button"
                className={
                  navigatorMethod === "voting"
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                onClick={() => setNavigatorMethod("voting")}
              >
                <img src="/icons/voting.svg" alt="voting" />
                Voting
              </button>
              <button
                type="button"
                className={
                  navigatorMethod === "bidding"
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                style={{ paddingBottom: "7px" }}
                onClick={() => setNavigatorMethod("bidding")}
              >
                <img src="/icons/hummer.svg" alt="voting" />
                Bidding
              </button>
              <button
                type="button"
                className={
                  navigatorMethod === "manual"
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                onClick={() => setNavigatorMethod("manual")}
              >
                <img src="/icons/manual.svg" alt="voting" />
                Manual
              </button>
            </div>
          </div>
        </div>
        <div className={styles.block}>
          <p>Bidding Time</p>
          <div className={styles.row}>
            <svg
              width="7"
              height="13"
              viewBox="0 0 7 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                cursor: biddingTime <= 5 ? "not-allowed" : "pointer",
                opacity: biddingTime <= 5 ? 0.5 : 1,
              }}
              onClick={() => biddingTime > 5 && handleTimeChange("decrease")}
            >
              <path
                d="M6.73232 0.282864C6.90372 0.464036 7 0.709725 7 0.965903C7 1.22208 6.90372 1.46777 6.73232 1.64894L2.2068 6.43119L6.73232 11.2134C6.89886 11.3956 6.99101 11.6397 6.98893 11.893C6.98684 12.1463 6.89069 12.3886 6.72118 12.5677C6.55168 12.7469 6.32237 12.8485 6.08266 12.8507C5.84295 12.8529 5.612 12.7555 5.43958 12.5795L0.267679 7.11423C0.0962845 6.93305 2.50216e-07 6.68737 2.40631e-07 6.43119C2.31046e-07 6.17501 0.0962844 5.92932 0.267679 5.74815L5.43958 0.282864C5.61102 0.101746 5.84352 -2.98403e-07 6.08595 -3.10783e-07C6.32837 -3.23163e-07 6.56087 0.101746 6.73232 0.282864Z"
                fill={biddingTime <= 5 ? "#999" : "white"}
              />
            </svg>
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                height: "20px",
                width: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span key={biddingTime}>{biddingTime} mins</span>
              {isAnimating && (
                <span
                  style={{
                    position: "absolute",
                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    transform: "translateX(60px) scale(0.9)",
                    opacity: 0,
                    color: "white",
                    animation: "slideInHorizontal 0.4s ease-out forwards",
                  }}
                >
                  {biddingTime} mins
                </span>
              )}
            </div>
            <svg
              width="7"
              height="13"
              viewBox="0 0 7 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                cursor: biddingTime >= 20 ? "not-allowed" : "pointer",
                opacity: biddingTime >= 20 ? 0.5 : 1,
              }}
              onClick={() => biddingTime < 20 && handleTimeChange("increase")}
            >
              <path
                d="M0.26768 12.5687C0.0962849 12.3875 4.84082e-07 12.1418 4.86697e-07 11.8857C4.89312e-07 11.6295 0.0962849 11.3838 0.26768 11.2026L4.7932 6.42037L0.26768 1.63813C0.101143 1.45592 0.00899136 1.21188 0.0110747 0.958567C0.0131575 0.705255 0.109308 0.462943 0.278817 0.283818C0.448325 0.104693 0.677631 0.00308982 0.917343 0.00088874C1.15706 -0.00131234 1.388 0.0960664 1.56042 0.272051L6.73232 5.73734C6.90372 5.91851 7 6.1642 7 6.42037C7 6.67655 6.90372 6.92224 6.73232 7.10341L1.56042 12.5687C1.38898 12.7498 1.15648 12.8516 0.914052 12.8516C0.671627 12.8516 0.439126 12.7498 0.26768 12.5687Z"
                fill={biddingTime >= 20 ? "#999" : "white"}
              />
            </svg>
          </div>
        </div>
        <div className={styles.block}>
          <p>Waypoints/Tasks</p>
          <button type="button" className={styles.typeBtn}>
            <img src="/icons/planet.svg" alt="" />
            Setup
          </button>
        </div>
        <div className={styles.block}>
          <p>Privacy settings</p>
          <div className={styles.fileRow}>
            <button
              type="button"
              className={
                settingsType === "option1"
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleSettingsType("option1")}
            >
              <img src="/icons/singleHero.svg" alt="" />
              Option 1
            </button>
            <button
              type="button"
              className={
                settingsType === "option2"
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleSettingsType("option2")}
            >
              <img src="/icons/multiHero.svg" alt="" />
              Option 2
            </button>
          </div>
        </div>
        <div className={styles.block}>
          <div className={styles.fileColumn}>
            <p>Scene Control</p>
            <button className={styles.controlBtn}>
              Tap to Open Control panel
            </button>
          </div>
        </div>
      </div>
      <div className={styles.btnContainer}>
        <button type="button" className={styles.createBtn}>
          Create
        </button>
      </div>
    </div>
  );
}
