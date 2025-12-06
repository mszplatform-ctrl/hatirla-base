import { useEffect, useState } from "react";
import MSZ from "./MSZCore";

// --------------------------------------------------
// API BASE URL (deploy uyumlu)
// --------------------------------------------------
const API_BASE = `${import.meta.env.VITE_API_URL}/api/data`;
const AI_BASE = `${import.meta.env.VITE_API_URL}/api/ai`;

// --------------------------------------------------
// TYPES
// --------------------------------------------------
type CitySummary = {
  id: number;
  name: string;
  countryCode: string;
  hotels: number;
  experiences: number;
};

type Hotel = {
  id: number;
  name: string;
  description: string | null;
  minPrice: number | null;
  currency: string | null;
};

type Experience = {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
};

type AISuggestion = {
  type: "hotel" | "experience" | "flight";
  score: number;
  payload: any;
};

type Itinerary = {
  items: any[];
  totalPrice: number;
  currency: string;
  summary?: string;
};

// --------------------------------------------------
// MODAL COMPONENT
// --------------------------------------------------
function Modal({ visible, onClose, children }: any) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "60px",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "520px",
          background: "white",
          padding: "28px",
          borderRadius: "18px",
          boxShadow: "0 8px 30px rgba(15,23,42,0.15)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{
            float: "right",
            background: "#eee",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          ✖
        </button>

        <div style={{ marginTop: "36px" }}>{children}</div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// MAIN APP
// --------------------------------------------------
export default function App() {
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const [selectedCity, setSelectedCity] = useState<CitySummary | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalType, setModalType] = useState<
    "hotel" | "experience" | "ai" | "itinerary" | null
  >(null);

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [selectedHotelIds, setSelectedHotelIds] = useState<number[]>([]);
  const [selectedExperienceIds, setSelectedExperienceIds] = useState<number[]>([]);
  const [composeLoading, setComposeLoading] = useState(false);

  const [mszComment, setMszComment] = useState<string | null>(null);

  // LOAD CITIES
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch(`${API_BASE}/cities`);
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error("CITY FETCH ERROR:", err);
      } finally {
        setLoadingCities(false);
      }
    }

    fetchCities();
  }, []);

  // LOAD HOTELS + EXPERIENCES
  async function handleCityClick(city: CitySummary) {
    setSelectedCity(city);
    setLoadingDetails(true);
    setHotels([]);
    setExperiences([]);
    setSelectedHotelIds([]);
    setSelectedExperienceIds([]);
    setMszComment(null);

    try {
      const [hotelsRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/hotels?cityId=${city.id}`),
        fetch(`${API_BASE}/experiences?cityId=${city.id}`),
      ]);

      setHotels(await hotelsRes.json());
      setExperiences(await expRes.json());
    } catch (err) {
      console.error("DETAIL FETCH ERROR:", err);
    } finally {
      setLoadingDetails(false);
    }
  }

  // MSZ MEMORY SYNC
  useEffect(() => {
    const items: any[] = [];

    hotels.forEach((h) => {
      if (selectedHotelIds.includes(h.id)) {
        items.push({
          type: "hotel",
          name: h.name,
          price: h.minPrice,
        });
      }
    });

    experiences.forEach((e) => {
      if (selectedExperienceIds.includes(e.id)) {
        items.push({
          type: "experience",
          title: e.title,
          price: e.price,
        });
      }
    });

    MSZ.remember("lastSelections", items);
  }, [selectedHotelIds, selectedExperienceIds, hotels, experiences]);

  // MODAL OPENERS
  function openHotelModal(hotel: Hotel) {
    setModalType("hotel");
    setModalData(hotel);
    setModalVisible(true);
  }

  function openExperienceModal(exp: Experience) {
    setModalType("experience");
    setModalData(exp);
    setModalVisible(true);
  }

  // SELECTION HANDLERS
  function toggleHotelSelection(h: Hotel) {
    setSelectedHotelIds((prev) =>
      prev.includes(h.id) ? prev.filter((id) => id !== h.id) : [...prev, h.id]
    );
  }

  function toggleExperienceSelection(e: Experience) {
    setSelectedExperienceIds((prev) =>
      prev.includes(e.id) ? prev.filter((id) => id !== e.id) : [...prev, e.id]
    );
  }

  // AI SUGGESTIONS
  async function handleAiSuggest() {
    try {
      setAiLoading(true);
      setAiSuggestions([]);

      const res = await fetch(`${AI_BASE}/suggestions`);
      const data = await res.json();
      setAiSuggestions(data);

      setModalType("ai");
      setModalVisible(true);
    } catch (err) {
      console.error("AI SUGGEST ERROR:", err);
      alert("AI önerileri alınırken bir hata oluştu.");
    } finally {
      setAiLoading(false);
    }
  }

  // AI COMPOSE
  async function handleComposeItinerary() {
    try {
      const selectedHotelsArr = hotels.filter((h) =>
        selectedHotelIds.includes(h.id)
      );
      const selectedExpArr = experiences.filter((e) =>
        selectedExperienceIds.includes(e.id)
      );

      if (selectedHotelsArr.length + selectedExpArr.length === 0) {
        alert("Önce en az bir otel veya deneyim seçmelisin.");
        return;
      }

      setComposeLoading(true);

      const selections: any[] = [];

      selectedHotelsArr.forEach((h) => {
        selections.push({
          type: "hotel",
          name: h.name,
          price: h.minPrice,
          currency: h.currency,
        });
      });

      selectedExpArr.forEach((e) => {
        selections.push({
          type: "experience",
          title: e.title,
          price: e.price,
          currency: e.currency,
        });
      });

      const analysis = MSZ.analyzeBeforeCompose(selections);
      setMszComment(analysis);

      const res = await fetch(`${AI_BASE}/compose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections }),
      });

      const data = await res.json();
      const itinerary: Itinerary = data.itinerary;

      setModalType("itinerary");
      setModalData(itinerary);
      setModalVisible(true);
    } catch (err) {
      console.error("AI COMPOSE ERROR:", err);
      alert("AI paket oluşturulurken bir hata oluştu.");
    } finally {
      setComposeLoading(false);
    }
  }

  const totalSelected =
    selectedHotelIds.length + selectedExperienceIds.length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "system-ui, sans-serif",
        background: "#f7fafc",
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* 🔥 XOTIJI BRANDING */}
      <h1
        style={{
          fontSize: "40px",
          marginBottom: "10px",
          fontWeight: 700,
          color: "#1e293b",
        }}
      >
        🌍 XOTIJI — Gerçek Veri Bağlantısı Aktif
      </h1>

      <p
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginTop: "4px",
          marginBottom: "4px",
        }}
      >
        Akıllı asistan seçimlerini takip ediyor ve paket oluşturmadan önce kısa
        bir yorum hazırlıyor.
      </p>

      {/* ACTION BAR */}
      <div
        style={{
          marginTop: "8px",
          marginBottom: "16px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleAiSuggest}
          disabled={aiLoading}
          style={{
            background: "#0f766e",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "999px",
            cursor: aiLoading ? "default" : "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            whiteSpace: "nowrap",
          }}
        >
          {aiLoading ? "AI düşünüyor..." : "✨ AI'dan 3 öneri al"}
        </button>

        <span style={{ fontSize: "12px", color: "#6b7280" }}>
          (Mock → gerçek AI daha sonra)
        </span>
      </div>

      {!loadingCities ? (
        <>
          <h2 style={{ marginTop: "16px", marginBottom: "4px" }}>Şehirler</h2>
          <p style={{ color: "gray", marginBottom: "16px" }}>
            NeonDB → Express API → React bağlantısı aktif.
          </p>

          {/* CITY GRID */}
          <div
            style={{
              marginTop: "12px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
              alignItems: "stretch",
            }}
          >
            {cities.map((city) => (
              <div
                key={city.id}
                style={{
                  padding: "24px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
                  cursor: "pointer",
                  background:
                    selectedCity?.id === city.id ? "#e6f4ff" : "white",
                  transition: "all 0.25s",
                }}
                onClick={() => handleCityClick(city)}
              >
                <h3
                  style={{
                    marginBottom: "10px",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  {city.name}
                </h3>

                <p style={{ margin: "4px 0" }}>Ülke: {city.countryCode}</p>
                <p style={{ margin: "4px 0" }}>🏨 Otel: {city.hotels}</p>
                <p style={{ margin: "4px 0" }}>🎭 Deneyim: {city.experiences}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Şehirler yükleniyor...</p>
      )}

      {selectedCity && (
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            borderRadius: "18px",
            background: "white",
            boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
          }}
        >
          <h2
            style={{ marginBottom: "8px", fontSize: "26px", fontWeight: 700 }}
          >
            🧭 {selectedCity.name} — Detaylar
          </h2>

          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              marginBottom: "12px",
            }}
          >
            Kartlara tıklayarak detay görebilir, pakete ekleyebilir veya
            çıkarabilirsin.
          </p>

          {loadingDetails ? (
            <p>Detaylar yükleniyor...</p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "28px",
                }}
              >
                {/* HOTELS */}
                <div>
                  <h3>🏨 Oteller ({hotels.length})</h3>

                  {hotels.map((h) => {
                    const selected = selectedHotelIds.includes(h.id);

                    return (
                      <div
                        key={h.id}
                        style={{
                          marginTop: "12px",
                          padding: "14px 16px",
                          borderRadius: "12px",
                          border: selected
                            ? "2px solid #0f766e"
                            : "1px solid #e2e8f0",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                          background: selected ? "#ecfdf5" : "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onClick={() => openHotelModal(h)}
                      >
                        <div>
                          <strong>{h.name}</strong>
                          {h.minPrice && (
                            <p style={{ fontSize: "13px" }}>
                              Başlangıç fiyatı: {h.minPrice} {h.currency}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHotelSelection(h);
                          }}
                          style={{
                            fontSize: "11px",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            border: "1px solid #0f766e",
                            background: selected ? "#0f766e" : "white",
                            color: selected ? "white" : "#0f766e",
                            cursor: "pointer",
                          }}
                        >
                          {selected ? "Paketten çıkar" : "Pakete ekle"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* EXPERIENCES */}
                <div>
                  <h3>🎭 Deneyimler ({experiences.length})</h3>

                  {experiences.map((e) => {
                    const selected = selectedExperienceIds.includes(e.id);

                    return (
                      <div
                        key={e.id}
                        style={{
                          marginTop: "12px",
                          padding: "14px 16px",
                          borderRadius: "12px",
                          border: selected
                            ? "2px solid #0f766e"
                            : "1px solid #e2e8f0",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                          background: selected ? "#ecfdf5" : "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onClick={() => openExperienceModal(e)}
                      >
                        <div>
                          <strong>{e.title}</strong>
                          {e.price && (
                            <p style={{ fontSize: "13px" }}>
                              Fiyat: {e.price} {e.currency}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            toggleExperienceSelection(e);
                          }}
                          style={{
                            fontSize: "11px",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            border: "1px solid #0f766e",
                            background: selected ? "#0f766e" : "white",
                            color: selected ? "white" : "#0f766e",
                            cursor: "pointer",
                          }}
                        >
                          {selected ? "Paketten çıkar" : "Pakete ekle"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COMPOSE BAR */}
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "12px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color:
                      totalSelected > 0 ? "#0f766e" : "rgba(148, 163, 184, 1)",
                  }}
                >
                  {totalSelected > 0
                    ? `${totalSelected} öğe seçildi — AI ile paket oluşturabilirsin.`
                    : "Paket için otel veya deneyim seç."}
                </span>

                <button
                  onClick={handleComposeItinerary}
                  disabled={composeLoading || totalSelected === 0}
                  style={{
                    background:
                      composeLoading || totalSelected === 0
                        ? "#cbd5f5"
                        : "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "999px",
                    cursor:
                      composeLoading || totalSelected === 0
                        ? "default"
                        : "pointer",
                  }}
                >
                  {composeLoading ? "AI paket oluşturuyor..." : "📦 AI ile paket oluştur"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        {modalType === "hotel" && modalData && (
          <>
            <h2 style={{ marginBottom: "8px" }}>🏨 {modalData.name}</h2>
            {modalData.description && <p>{modalData.description}</p>}
            {modalData.minPrice && (
              <p>
                Fiyat: {modalData.minPrice} {modalData.currency}
              </p>
            )}
          </>
        )}

        {modalType === "experience" && modalData && (
          <>
            <h2 style={{ marginBottom: "8px" }}>🎭 {modalData.title}</h2>
            {modalData.category && <p>Kategori: {modalData.category}</p>}
            {modalData.description && <p>{modalData.description}</p>}
            {modalData.price && (
              <p>
                Fiyat: {modalData.price} {modalData.currency}
              </p>
            )}
          </>
        )}

        {modalType === "ai" && (
          <>
            <h2 style={{ marginBottom: "12px" }}>✨ AI Önerileri</h2>
            {aiSuggestions.length === 0 && <p>Şu anda öneri yok.</p>}
            {aiSuggestions.map((s, idx) => (
              <div
                key={idx}
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  {s.type} • skor: {s.score.toFixed(2)}
                </p>

                <strong>{s.payload.name || s.payload.title}</strong>

                {s.payload.price && (
                  <p>
                    Fiyat: {s.payload.price} {s.payload.currency}
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        {modalType === "itinerary" && modalData && (
          <>
            <h2 style={{ marginBottom: "10px" }}>📦 AI Paket Özeti</h2>

            {mszComment && (
              <div
                style={{
                  marginBottom: "14px",
                  padding: "10px 14px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "#14532d",
                }}
              >
                <strong style={{ fontSize: "13px", color: "#166534" }}>
                  AI'nin kısa yorumu:
                </strong>
                <br />
                {mszComment}
              </div>
            )}

            <p style={{ fontWeight: 600, marginBottom: "10px" }}>
              Toplam Fiyat: {modalData.totalPrice} {modalData.currency}
            </p>

            <div>
              {modalData.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    marginTop: "8px",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.type}
                  </p>

                  <strong>{item.name || item.title}</strong>

                  {(item.price || item.minPrice) && (
                    <p style={{ fontSize: "13px" }}>
                      {(item.price || item.minPrice) +
                        " " +
                        (item.currency || modalData.currency)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
