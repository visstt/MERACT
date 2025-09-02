import styles from "./GuildCard.module.css";

export default function GuildCard() {
  return (
    <div className={styles.guildCard}>
      <div className={styles.content}>
        <img
          src="/icons/guild/light.svg"
          alt="light"
          className={styles.light}
        />
        <div className={styles.name}>
          <h1>Guild Name</h1>
        </div>
        <div className={styles.description}>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex illo
            fugiat reiciendis culpa
          </p>
        </div>
        <div className={styles.info}></div>
        <p>Guild Acts</p>
        <h2>145/179</h2>
      </div>
    </div>
  );
}
