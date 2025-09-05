import { useRef, useState } from "react";

import styles from "./CreateAct.module.css";

export default function CreateAct() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.glass}>
      <div className={styles.header}>
        <div className={styles.name}>
          <img src="/icons/back_arrowV2.svg" alt="back_arrow" />
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
              value={fileName}
              placeholder="No file chosen"
              className={styles.fileDisplay}
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
          <input type="text" placeholder="Act Title" />
        </div>
        <div className={styles.block}>
          <p>Stream format</p>
          <input type="text" placeholder="Act Title" />
        </div>
        <div className={styles.block}>
          <p>Hero Selection Methods</p>
          <input type="text" placeholder="Act Title" />
        </div>
        <div className={styles.block}>
          <p>Navigator Selection Methods</p>
          <input type="text" placeholder="Act Title" />
        </div>
        <div className={styles.block}>
          <p>Bidding Time</p>
          <input type="text" placeholder="Act Title" />
        </div>
        <div className={styles.block}>
          <p>Waypoints/Tasks</p>
          <input type="text" placeholder="Act Title" />
        </div>
        <div className={styles.block}>
          <p>Privacy settings</p>
          <input type="text" placeholder="Act Title" />
        </div>
        <div className={styles.block}>
          <p>Scene Control</p>
          <input type="text" placeholder="Act Title" />
        </div>
      </div>
    </div>
  );
}
