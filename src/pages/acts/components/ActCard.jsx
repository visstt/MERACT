import styles from "./ActCard.module.css";

export default function ActCard() {
  return (
    <div className={styles.actCard}>
      <h1>Voices in the Crowd </h1>
      <h3>
        Lorem ipsum is a dummy or placeholder text commonly used in graphic
        design, publishing
      </h3>
      <p>
        Navigator: Graphite8 ; Hero: Graphite8, NeonFox, ShadowWeave, EchoStorm1
      </p>

      <div className={styles.stripe}></div>
      <div className={styles.blocks}>
        <p>Puerto de la Cruz (ES)</p>
        <p>2,500km Away</p>
      </div>

      <div className={styles.info}>
        <div className={styles.arrows}>
          <span className={styles.arrow}>
            <img src="/icons/arrowUp.svg" alt="arrow" />
            <h2>12</h2>
          </span>
          <span className={styles.arrow}>
            <img src="/icons/arrowDown.svg" alt="arrow" />
            <h2>12</h2>
          </span>
        </div>

        <h4>Live in 2h 15m</h4>
      </div>

      <img
        src="/icons/link_icon.png"
        alt="link_icon"
        className={styles.linkIcon}
      />
      <img
        src="/icons/favorites_icon.png"
        alt="favorites_icon"
        className={styles.favoritesIcon}
      />
    </div>
  );
}
