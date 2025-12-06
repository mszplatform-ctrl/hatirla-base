import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedDest, setSelectedDest] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const API = "http://localhost:4000/api";

  useEffect(() => {
    async function loadAll() {
      try {
        const [
          destRes,
          userRes,
          refRes,
          suggRes
        ] = await Promise.all([
          fetch(`${API}/data/destinations`),
          fetch(`${API}/users`),
          fetch(`${API}/referral`),
          fetch(`${API}/ai/suggestions`)
        ]);

        const destData = await destRes.json();
        const userData = await userRes.json();
        const refData = await refRes.json();
        const suggData = await suggRes.json();

        setDestinations(destData.destinations || []);
        setUsers(userData.users || []);
        setReferrals(refData.referrals || []);
        setSuggestions(suggData || []);

      } catch (err) {
        console.error("Admin load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // Experiences seçili destinasyona göre çekilir
  useEffect(() => {
    if (!selectedDest) return;

    fetch(`${API}/data/experiences?destination_id=${selectedDest}`)
      .then((res) => res.json())
      .then((data) => {
        setExperiences(data.experiences || []);
      })
      .catch((err) => console.error("Experience fetch error:", err));
  }, [selectedDest]);

  if (loading) return <h2>⏳ Admin Panel yükleniyor...</h2>;

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🛠 XOTIJI — Admin Panel</h1>

      {/* DESTINATIONS */}
      <section style={{ marginTop: "40px" }}>
        <h2>🌍 Destinasyonlar</h2>
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad</th>
              <th>Ülke</th>
              <th>Slug</th>
              <th>Deneyimler</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.country}</td>
                <td>{d.slug}</td>
                <td>
                  <button onClick={() => setSelectedDest(d.id)}>
                    Görüntüle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* EXPERIENCES */}
      {selectedDest && (
        <section style={{ marginTop: "40px" }}>
          <h2>🎯 Deneyimler (Dest ID: {selectedDest})</h2>

          {experiences.length === 0 ? (
            <p>Bu destinasyona ait deneyim yok.</p>
          ) : (
            <table border={1} cellPadding={8}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Başlık</th>
                  <th>Açıklama</th>
                  <th>Fiyat Aralığı</th>
                  <th>Taglar</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.title}</td>
                    <td>{e.description}</td>
                    <td>{e.price_range}</td>
                    <td>{e.tags}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* USERS */}
      <section style={{ marginTop: "40px" }}>
        <h2>👤 Kullanıcılar</h2>
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* REFERRALS */}
      <section style={{ marginTop: "40px" }}>
        <h2>🔗 Referral Kodları</h2>
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Kod</th>
              <th>Kullanım Sayısı</th>
              <th>Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.user_id}</td>
                <td>{r.code}</td>
                <td>{r.used_count}</td>
                <td>{r.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* AI Suggestions */}
      <section style={{ marginTop: "40px" }}>
        <h2>🤖 AI Önerileri</h2>
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Tür</th>
              <th>Ad / Başlık</th>
              <th>Fiyat</th>
              <th>Skor</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s, i) => (
              <tr key={i}>
                <td>{s.type}</td>
                <td>{s.payload.name || s.payload.title}</td>
                <td>{s.payload.price}</td>
                <td>{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}


