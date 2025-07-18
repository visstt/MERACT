import { useState } from "react";
import styles from "./GuildsPage.module.css";

const mockGuilds = [
  {
    id: 1,
    name: "Northern Wolves",
    motto: "Strength in unity",
    description:
      "A guild uniting players for joint PvE adventures and raids. Friendly atmosphere and support for newcomers.",
    members: 42,
    region: "North",
    type: "PvE",
    color: "#4299e1",
    icon: "🐺",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Eastern Dragons",
    motto: "Honor above all",
    description:
      "PvP guild for fans of battles and tournaments. Here, strategy, teamwork, and fair play are valued.",
    members: 28,
    region: "East",
    type: "PvP",
    color: "#ed8936",
    icon: "🐉",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Southern Phoenix",
    motto: "Rise again",
    description:
      "A social guild for communication, joint events, and support. New friends are always welcome here!",
    members: 35,
    region: "South",
    type: "Social",
    color: "#38a169",
    icon: "🦅",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
  },
];

const regions = ["All", "North", "East", "South", "West"];
const types = ["All", "PvE", "PvP", "Social"];

export const GuildsPage = () => {
  const [region, setRegion] = useState("All");
  const [type, setType] = useState("All");
  const filteredGuilds = mockGuilds.filter(
    (g) =>
      (region === "All" || g.region === region) &&
      (type === "All" || g.type === type)
  );

  return (
    <div className={styles.guildsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Guilds</h1>
        <div className={styles.filters}>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={styles.select}
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.select}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.list}>
        {filteredGuilds.map((guild) => (
          <div
            key={guild.id}
            className={styles.guildCard}
            style={{ cursor: "pointer" }}
          >
            <img
              src={guild.image}
              alt={guild.name}
              className={styles.guildImage}
            />
            <div
              className={styles.guildBadge}
              style={{ backgroundColor: guild.color }}
            >
              {guild.type}
            </div>
            <div className={styles.info}>
              <div className={styles.guildName}>{guild.name}</div>
              <div className={styles.guildMotto}>{guild.motto}</div>
              <div className={styles.guildDescription}>{guild.description}</div>
              <div className={styles.guildMeta}>
                <span className={styles.guildMetaItem}>
                  <b>{guild.members}</b> members
                </span>
                <span className={styles.guildMetaItem}>{guild.region}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
