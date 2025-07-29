import { useEffect, useState } from "react";

import { getActiveStreams } from "../../services/streamApi.js";
import CustomSelect from "../../shared/ui/CustomSelect";
import styles from "./ActsPage.module.css";
import ActCard from "./components/ActCard";

export default function ActsPage() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSortChange = (option) => {
    console.log("Selected sort option:", option);
  };

  useEffect(() => {
    const loadStreams = async () => {
      try {
        setLoading(true);
        const activeStreams = await getActiveStreams();
        console.log("Loaded active streams:", activeStreams);
        setStreams(activeStreams);
      } catch (error) {
        console.error("Error loading streams:", error);
        // Показываем mock карточку если не удалось загрузить
        setStreams([]);
      } finally {
        setLoading(false);
      }
    };

    loadStreams();

    // Обновляем список каждые 30 секунд
    const interval = setInterval(loadStreams, 30000);
    return () => clearInterval(interval);
  }, []);

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

        {loading ? (
          <div className={styles.loading}>Загрузка стримов...</div>
        ) : (
          <div className={styles.streamsList}>
            {streams.length > 0 ? (
              streams.map((stream) => (
                <ActCard
                  key={stream.id}
                  streamData={{
                    ...stream,
                    streamId: stream.id, // Маппим id в streamId для совместимости
                    status: "ONLINE", // Добавляем статус, так как все активные стримы онлайн
                    previewFileName: null, // Пока нет превью
                  }}
                />
              ))
            ) : (
              // Показываем mock карточку если нет активных стримов
              <ActCard />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
