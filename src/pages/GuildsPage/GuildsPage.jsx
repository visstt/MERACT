import { useState, useEffect } from "react";
import styles from "./GuildsPage.module.css";
import api from '../../shared/lib/axios';

const REGIONS = ["North", "East", "South", "West"];
const TYPES = ["PvE", "PvP", "Social"];

const initialForm = {
  name: '',
  motto: '',
  description: '',
  region: REGIONS[0],
  type: TYPES[0],
  image: '',
};

// Remove useEffect and fetchGuilds, work only with local state
const defaultGuilds = [
  {
    id: 1,
    name: "Northern Wolves",
    motto: "Strength in unity",
    description: "A guild uniting players for joint PvE adventures and raids. Friendly atmosphere and support for newcomers.",
    members: 42,
    region: "North",
    type: "PvE",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Eastern Dragons",
    motto: "Honor above all",
    description: "PvP guild for fans of battles and tournaments. Here, strategy, teamwork, and fair play are valued.",
    members: 28,
    region: "East",
    type: "PvP",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
  },
];

export const GuildsPage = () => {
  const [guilds, setGuilds] = useState(defaultGuilds);
  const [region, setRegion] = useState("All");
  const [type, setType] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Remove useEffect and fetchGuilds, work only with local state
  // const fetchGuilds = async () => {
  //   try {
  //     const res = await api.get('/guild/all');
  //     setGuilds(res.data);
  //   } catch {
  //     setError('Failed to load guilds');
  //   }
  // };

  const openCreate = () => {
    setForm(initialForm);
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (guild) => {
    setForm({
      name: guild.name,
      motto: guild.motto,
      description: guild.description,
      region: guild.region,
      type: guild.type,
      image: guild.image || '',
    });
    setEditId(guild.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(initialForm);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (editId) {
        setGuilds(guilds => guilds.map(g => g.id === editId ? { ...g, ...form } : g));
      } else {
        setGuilds(guilds => [
          ...guilds,
          { ...form, id: Date.now(), members: 0 },
        ]);
      }
      closeModal();
      setLoading(false);
    }, 500);
  };

  const filteredGuilds = guilds.filter(
    (g) =>
      (region === "All" || g.region === region) &&
      (type === "All" || g.type === type)
  );

  return (
    <div className={styles.guildsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Guilds</h1>
        <button className={styles.guildButton + ' ' + styles.editButton} onClick={openCreate}>+ Create Guild</button>
        <div className={styles.filters}>
          <select value={region} onChange={e => setRegion(e.target.value)} className={styles.select}>
            <option value="All">All</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)} className={styles.select}>
            <option value="All">All</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.list}>
        {filteredGuilds.map((guild) => (
          <div key={guild.id} className={styles.guildCard} style={{ cursor: "pointer" }}>
            <img src={guild.image} alt={guild.name} className={styles.guildImage} />
            <div className={styles.guildBadge}>{guild.type}</div>
            <div className={styles.info}>
              <div className={styles.guildName}>{guild.name}</div>
              <div className={styles.guildMotto}>{guild.motto}</div>
              <div className={styles.guildDescription}>{guild.description}</div>
              <div className={styles.guildMeta}>
                <span className={styles.guildMetaItem}><b>{guild.members}</b> members</span>
                <span className={styles.guildMetaItem}>{guild.region}</span>
              </div>
              <button className={styles.guildButton + ' ' + styles.editButton} onClick={() => openEdit(guild)}>Edit</button>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <h2>{editId ? 'Edit Guild' : 'Create Guild'}</h2>
              <label>
                Name
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                Motto
                <input name="motto" value={form.motto} onChange={handleChange} required />
              </label>
              <label>
                Description
                <textarea name="description" value={form.description} onChange={handleChange} required />
              </label>
              <label>
                Region
                <select name="region" value={form.region} onChange={handleChange} required>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label>
                Type
                <select name="type" value={form.type} onChange={handleChange} required>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>
                Image URL
                <input name="image" value={form.image} onChange={handleChange} />
              </label>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} className={styles.cancelButton}>Cancel</button>
                <button type="submit" disabled={loading} className={styles.primaryButton}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
