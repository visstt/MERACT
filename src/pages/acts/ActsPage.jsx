import React, { useEffect, useState } from "react";

import api from "../../shared/api/api";
import CustomSelect from "../../shared/ui/CustomSelect";
import NavBar from "../../shared/ui/NavBar/NavBar";
import styles from "./ActsPage.module.css";
import ActCard from "./components/ActCard";

export default function ActsPage() {
  const [acts, setActs] = useState([
    {
      id: 1,
      title: "Voices in the Crowd",
      description:
        "Lorem ipsum is a dummy or placeholder text commonly used in graphic design, publishing",
      navigator: "Graphite8",
      heroes: ["Graphite8", "NeonFox", "ShadowWeave", "EchoStorm1"],
      location: "Puerto de la Cruz (ES)",
      distance: "2,500km Away",
      upvotes: 12,
      downvotes: 12,
      liveIn: "2h 15m",
      isMock: true,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/act/get-acts")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setActs((prev) => [
            prev[0],
            ...res.data.map((act) => ({
              ...act,
              title: act.name,
              description: act.status,
              navigator: act.user,
              location: act.category,
              distance: act.duration,
              upvotes: 0,
              downvotes: 0,
              liveIn: act.duration,
              isMock: false,
            })),
          ]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Ошибка загрузки актов");
        setLoading(false);
      });
  }, []);

  const handleSortChange = (option) => {
    console.log("Selected sort option:", option);
  };

  return (
    <div>
      <div className="header">
        <div className="name">
          <img src="/icons/back_arrow.svg" alt="back_arrow" />
          <h1>ACTS</h1>
        </div>
        <div className="nav">
          <input type="text" placeholder="Search..." />
          <img src="/icons/bell.svg" alt="bell" />
        </div>
      </div>
      <div className="stripe"></div>

      <div className={styles.actsPage}>
        <form className={styles.form}>
          <CustomSelect
            defaultValue="Language"
            options={["English", "Spanish"]}
            onChange={handleSortChange}
          />
          <CustomSelect
            defaultValue="Proximity"
            options={["Proximity", "Proximity"]}
            onChange={handleSortChange}
          />
          <CustomSelect
            defaultValue="Act Status"
            options={["Active", "Inactive"]}
            onChange={handleSortChange}
          />
          <CustomSelect
            defaultValue="Sort By"
            options={[
              "By Proximity",
              "By Votes",
              "By Viewer Number",
              "By Number of Bidder",
              "By Comments",
            ]}
            onChange={handleSortChange}
          />

          <CustomSelect
            defaultValue="Guild-initiated acts"
            options={["Active", "Inactive"]}
            onChange={handleSortChange}
          />
          <CustomSelect
            defaultValue="Hero Type"
            options={["Active", "Inactive"]}
            onChange={handleSortChange}
          />
          <button className={styles.addActButton}>ADD ACT</button>
        </form>

        <div className={styles.streamsList}>
          {acts && acts.length > 0 ? (
            acts.map((act) => (
              <ActCard
                key={act.id || Math.random()}
                act={{
                  ...act,
                  title: act.title || act.name || "Без названия",
                  description: act.description || act.status || "Нет описания",
                  navigator: act.navigator || act.user || "Не указан",
                  location: act.location || act.category || "Не указано",
                  distance: act.distance || act.duration || "Не указано",
                  previewFileName: act.previewFileName || "",
                  imageUrl:
                    act.imageUrl ||
                    (act.previewFileName
                      ? `/uploads/${act.previewFileName}`
                      : undefined),
                  upvotes: typeof act.upvotes === "number" ? act.upvotes : 0,
                  downvotes:
                    typeof act.downvotes === "number" ? act.downvotes : 0,
                  liveIn: act.liveIn || act.duration || "Скоро...",
                  isMock: act.isMock || false,
                }}
              />
            ))
          ) : (
            <div>Нет доступных актов</div>
          )}
        </div>
        <NavBar />
      </div>
    </div>
  );
}
