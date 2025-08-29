import styles from "./NavBar.module.css";

export default function NavBar() {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div className={styles.playBtn + " " + styles.playBtnFloating}>
        <img src="/icons/NavBar/playBtn.svg" alt="playBtn" />
      </div>
      <div className={styles.navBar}>
        <div className={styles.nav}>
          <div className={styles.item}>
            <img src="/icons/NavBar/actLogo.svg" alt="actLogo" />
            <p>Acts</p>
          </div>
          <div className={styles.item}>
            <img src="/icons/NavBar/chatLogo.svg" alt="chatLogo" />
            <p>Chat</p>
          </div>
          <div className={styles.item}>
            <img src="/icons/NavBar/guildLogo.svg" alt="guildLogo" />
            <p>Guilds</p>
          </div>
          <div className={styles.item}>
            <img src="/icons/NavBar/rankLogo.svg" alt="rankLogo" />
            <p>Rank</p>
          </div>
        </div>
      </div>
    </div>
  );
}
