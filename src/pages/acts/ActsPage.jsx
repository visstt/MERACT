import React from "react";

import CustomSelect from "../../shared/ui/CustomSelect";
import NavBar from "../../shared/ui/NavBar/NavBar";
import styles from "./ActsPage.module.css";
import ActCard from "./components/ActCard";

export default function ActsPage() {
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
          {/* Моковые карточки для примера */}
          <ActCard
            streamData={{
              streamName: "Voices in the Crowd",
              status: "ONLINE",
              startedAt: new Date().toISOString(),
              previewFileName: null,
            }}
          />
          <ActCard
            streamData={{
              streamName: "Another Stream",
              status: "ONLINE",
              startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
              previewFileName: null,
            }}
          />
        </div>
        <NavBar />
      </div>
    </div>
  );
}
