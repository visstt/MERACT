import React, { useEffect, useState } from "react";

import axios from "axios";

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
    axios
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
          {acts.map((act) => (
            <ActCard key={act.id} act={act} />
          ))}
        </div>
        <NavBar />
      </div>
    </div>
  );
}
