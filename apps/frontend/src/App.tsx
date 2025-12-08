// App.tsx — XOTIJI MOBILE-FIRST FIX

import { useEffect, useState } from "react";
import MSZ from "./MSZCore";
import "./xotiji-brand.css"; 

const API_BASE = `${import.meta.env.VITE_API_URL}/api/data`;
const AI_BASE = `${import.meta.env.VITE_API_URL}/api/ai`;

type CitySummary = {
  id: number;
  name: string;
  country?: string;        // Backend'den country veya countryCode gelebilir
  countryCode?: string;
  country_code?: string;
  hotels?: number;         // Backend'den hotels veya hotel_count gelebilir  
  hotel_count?: number;
  experiences?: number;    // Backend'den experiences veya experience_count gelebilir
  experience_count?: number;
};

type Hotel = {
  id: number;
  name: string;
  description: string | null;
  minPrice: number | null;
  min_price?: number | null;  // Backend snake_case kullanıyor olabilir
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
        overflowY: "auto",
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

export default function App() {
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const [selectedCity, setSelectedCity] = useState<CitySummary | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalType, setModalType] =
    useState<"hotel" | "experience" | "ai" | "itinerary" | null>(null);

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [selectedHotelIds, setSelectedHotelIds] = useState<number[]>([]);
  const [selectedExperienceIds, setSelectedExperienceIds] = useState<number[]>([]);
  const [composeLoading, setComposeLoading] = useState(false);

  const [mszComment, setMszComment] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch(`${API_BASE}/cities`);
        const data = await res.json();
        console.log("📥 Cities data:", data); // Debug için
        setCities(data);
      } catch (err) {
        console.error("CITY FETCH ERROR:", err);
      } finally {
        setLoadingCities(false);
      }
    }

    fetchCities();
  }, []);

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

      const hotelsData = await hotelsRes.json();
      const expData = await expRes.json();
      
      console.log("📥 Hotels data:", hotelsData); // Debug için
      console.log("📥 Experiences data:", expData); // Debug için

      setHotels(hotelsData);
      setExperiences(expData);
    } catch (err) {
      console.error("DETAIL FETCH ERROR:", err);
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    const items: any[] = [];

    hotels.forEach((h) => {
      if (selectedHotelIds.includes(h.id)) {
        items.push({
          type: "hotel",
          name: h.name,
          price: h.minPrice || h.min_price,
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
          price: h.minPrice || h.min_price,
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

  const totalSelected = selectedHotelIds.length + selectedExperienceIds.length;

  // 🔧 Helper function: Backend'den gelen farklı field name'lerini normalize et
  function getCountryCode(city: CitySummary): string {
    return city.countryCode || city.country_code || city.country || "??";
  }

  function getHotelCount(city: CitySummary): number {
    return city.hotels ?? city.hotel_count ?? 0;
  }

  function getExperienceCount(city: CitySummary): number {
    return city.experiences ?? city.experience_count ?? 0;
  }

  function getHotelPrice(hotel: Hotel): number | null {
    return hotel.minPrice ?? hotel.min_price ?? null;
  }

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
        background: "#f7fafc",
        width: "100%",
        minHeight: "100vh",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* LOGO */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
        <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M 15 70 Q 50 62 85 70" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="50" cy="70" r="16" fill="none" stroke="#fb923c" strokeWidth="3.5"/>
          <circle cx="50" cy="70" r="10" fill="#fb923c" opacity="0.25"/>
          <line x1="50" y1="47" x2="50" y2="40" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
          <line x1="65" y1="54" x2="70" y2="49" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
          <line x1="35" y1="54" x2="30" y2="49" stroke="#fb923c" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <h1 style={{fontWeight: 800,color: "#0ea5e9",fontSize: "clamp(1.8rem, 5vw, 2.5rem)",letterSpacing: "-0.02em",margin: 0,lineHeight: 1}}>
          xotiji.
        </h1>
      </div>

      {/* AÇIKLAMA */}
      <p style={{fontSize: "15px",color: "#475569",marginBottom: "8px",fontWeight: 500}}>
        Gerçek Veri Bağlantısı Aktif
      </p>
      <p style={{fontSize: "13px",color: "#64748b",marginBottom: "20px"}}>
        Akıllı asistan seçimlerini takip ediyor ve paket oluşturmadan önce kısa bir yorum hazırlıyor.
      </p>

      <div style={{marginTop: "8px",marginBottom: "16px",display: "flex",gap: "12px",alignItems: "center",flexWrap: "wrap"}}>
        <button onClick={handleAiSuggest} disabled={aiLoading}
          style={{background: "#0f766e",color: "white",border: "none",padding: "10px 18px",borderRadius: "999px",
          cursor: aiLoading ? "default" : "pointer",fontSize: "14px",display: "flex",alignItems: "center",gap: "6px",whiteSpace: "nowrap"}}>
          {aiLoading ? "AI düşünüyor..." : "✨ AI'dan 3 öneri al"}
        </button>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>(Mock → gerçek AI daha sonra)</span>
      </div>

      {!loadingCities ? (
        <>
          <h2 style={{ marginTop: "16px", marginBottom: "4px" }}>Şehirler</h2>
          <p style={{ color: "gray", marginBottom: "16px" }}>NeonDB → Express API → React bağlantısı aktif.</p>

          {/* 🔧 MOBİL FİX: minmax artık daha esnek */}
          <div style={{
            marginTop: "12px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "16px",
            alignItems: "stretch"
          }}>
            {cities.map((city) => {
              const countryCode = getCountryCode(city);
              const hotelCount = getHotelCount(city);
              const expCount = getExperienceCount(city);

              return (
                <div key={city.id}
                  style={{
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
                    cursor: "pointer",
                    background: selectedCity?.id === city.id ? "#e6f4ff" : "white",
                    transition: "all 0.25s"
                  }}
                  onClick={() => handleCityClick(city)}>
                  <h3 style={{marginBottom: "10px",fontSize: "20px",fontWeight: 600,color: "#0f172a"}}>{city.name}</h3>
                  <p style={{ margin: "4px 0", fontSize: "14px", color: "#334155", fontWeight: 500 }}>🌍 Ülke: {countryCode}</p>
                  <p style={{ margin: "4px 0", fontSize: "14px", color: "#334155", fontWeight: 500 }}>🏨 Otel: {hotelCount}</p>
                  <p style={{ margin: "4px 0", fontSize: "14px", color: "#334155", fontWeight: 500 }}>🎭 Deneyim: {expCount}</p>
                </div>
              );
            })}
          </div>
        </>
      ) : (<p>Şehirler yükleniyor...</p>)}

      {selectedCity && (
        <div style={{marginTop: "32px",padding: "20px",borderRadius: "18px",background: "white",boxShadow: "0 6px 18px rgba(15,23,42,0.08)"}}>
          <h2 style={{ marginBottom: "8px", fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 700 }}>🧭 {selectedCity.name} — Detaylar</h2>
          <p style={{fontSize: "13px",color: "#475569",marginBottom: "12px"}}>Kartlara tıklayarak detay görebilir, pakete ekleyebilir veya çıkarabilirsin.</p>

          {loadingDetails ? (<p>Detaylar yükleniyor...</p>) : (
            <>
              {/* 🔧 MOBİL FİX: Grid artık responsive, mobilde alt alta */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: "28px"
              }}>
                <div>
                  <h3 style={{ fontSize: "18px" }}>🏨 Oteller ({hotels.length})</h3>
                  {hotels.length === 0 ? (
                    <p style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>Bu şehirde henüz otel yok.</p>
                  ) : (
                    hotels.map((h) => {
                      const selected = selectedHotelIds.includes(h.id);
                      const price = getHotelPrice(h);
                      
                      return (
                        <div key={h.id}
                          style={{
                            marginTop: "12px",
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: selected ? "2px solid #0f766e" : "1px solid #e2e8f0",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                            background: selected ? "#ecfdf5" : "white",
                          }}
                          onClick={() => openHotelModal(h)}>
                          <div style={{ marginBottom: "8px" }}>
                            <strong style={{ fontSize: "15px" }}>{h.name}</strong>
                            {price && (
                              <p style={{ fontSize: "13px", margin: "4px 0 0 0", color: "#334155", fontWeight: 500 }}>
                                Başlangıç: {price} {h.currency || "TL"}
                              </p>
                            )}
                          </div>
                          <button onClick={(e) => {e.stopPropagation();toggleHotelSelection(h);}}
                            style={{
                              fontSize: "11px",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              border: "1px solid #0f766e",
                              background: selected ? "#0f766e" : "white",
                              color: selected ? "white" : "#0f766e",
                              cursor: "pointer",
                              marginTop: "6px"
                            }}>
                            {selected ? "Paketten çıkar" : "Pakete ekle"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: "18px" }}>🎭 Deneyimler ({experiences.length})</h3>
                  {experiences.length === 0 ? (
                    <p style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>Bu şehirde henüz deneyim yok.</p>
                  ) : (
                    experiences.map((e) => {
                      const selected = selectedExperienceIds.includes(e.id);
                      
                      return (
                        <div key={e.id}
                          style={{
                            marginTop: "12px",
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: selected ? "2px solid #0f766e" : "1px solid #e2e8f0",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                            background: selected ? "#ecfdf5" : "white",
                          }}
                          onClick={() => openExperienceModal(e)}>
                          <div style={{ marginBottom: "8px" }}>
                            <strong style={{ fontSize: "15px" }}>{e.title}</strong>
                            {e.price && (
                              <p style={{ fontSize: "13px", margin: "4px 0 0 0", color: "#334155", fontWeight: 500 }}>
                                Fiyat: {e.price} {e.currency || "TL"}
                              </p>
                            )}
                          </div>
                          <button onClick={(ev) => {ev.stopPropagation();toggleExperienceSelection(e);}}
                            style={{
                              fontSize: "11px",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              border: "1px solid #0f766e",
                              background: selected ? "#0f766e" : "white",
                              color: selected ? "white" : "#0f766e",
                              cursor: "pointer",
                              marginTop: "6px"
                            }}>
                            {selected ? "Paketten çıkar" : "Pakete ekle"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{
                marginTop: "24px",
                paddingTop: "12px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <span style={{fontSize: "13px",color: totalSelected > 0 ? "#0f766e" : "rgba(148,163,184,1)"}}>
                  {totalSelected > 0 ? `${totalSelected} öğe seçildi — AI ile paket oluşturabilirsin.` : "Paket için otel veya deneyim seç."}
                </span>
                <button onClick={handleComposeItinerary} disabled={composeLoading || totalSelected === 0}
                  style={{
                    background: composeLoading || totalSelected === 0 ? "#cbd5e1" : "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "999px",
                    cursor: composeLoading || totalSelected === 0 ? "default" : "pointer",
                    fontSize: "14px",
                    width: "100%"
                  }}>
                  {composeLoading ? "AI paket oluşturuyor..." : "📦 AI ile paket oluştur"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        {modalType === "hotel" && modalData && (
          <>
            <h2 style={{ marginBottom: "8px" }}>🏨 {modalData.name}</h2>
            {modalData.description && <p style={{ fontSize: "14px", lineHeight: 1.6 }}>{modalData.description}</p>}
            {(modalData.minPrice || modalData.min_price) && (
              <p style={{ fontSize: "15px", fontWeight: 600, marginTop: "12px" }}>
                Fiyat: {modalData.minPrice || modalData.min_price} {modalData.currency || "TL"}
              </p>
            )}
          </>
        )}

        {modalType === "experience" && modalData && (
          <>
            <h2 style={{ marginBottom: "8px" }}>🎭 {modalData.title}</h2>
            {modalData.category && <p style={{ fontSize: "13px", color: "#6b7280" }}>Kategori: {modalData.category}</p>}
            {modalData.description && <p style={{ fontSize: "14px", lineHeight: 1.6, marginTop: "8px" }}>{modalData.description}</p>}
            {modalData.price && (
              <p style={{ fontSize: "15px", fontWeight: 600, marginTop: "12px" }}>
                Fiyat: {modalData.price} {modalData.currency || "TL"}
              </p>
            )}
          </>
        )}

        {modalType === "ai" && (
          <>
            <h2 style={{ marginBottom: "12px" }}>✨ AI Önerileri</h2>
            {aiSuggestions.length === 0 && <p>Şu anda öneri yok.</p>}
            {aiSuggestions.map((s, idx) => (
              <div key={idx} style={{marginTop: "12px",padding: "12px",border: "1px solid #e2e8f0",borderRadius: "12px"}}>
                <p style={{fontSize: "12px",color: "#6b7280",marginBottom: "4px",textTransform: "uppercase"}}>
                  {s.type} • skor: {s.score.toFixed(2)}
                </p>
                <strong>{s.payload.name || s.payload.title}</strong>
                {s.payload.price && (<p style={{ fontSize: "14px", marginTop: "4px" }}>Fiyat: {s.payload.price} {s.payload.currency}</p>)}
              </div>
            ))}
          </>
        )}

        {modalType === "itinerary" && modalData && (
          <>
            <h2 style={{ marginBottom: "10px" }}>📦 AI Paket Özeti</h2>
            {mszComment && (
              <div style={{marginBottom: "14px",padding: "10px 14px",background: "#f0fdf4",
                border: "1px solid #bbf7d0",borderRadius: "10px",fontSize: "14px",color: "#14532d"}}>
                <strong style={{ fontSize: "13px", color: "#166534" }}>AI'nin kısa yorumu:</strong><br />{mszComment}
              </div>
            )}
            <p style={{ fontWeight: 600, marginBottom: "10px", fontSize: "16px" }}>
              Toplam Fiyat: {modalData.totalPrice} {modalData.currency}
            </p>
            <div>
              {modalData.items.map((item: any, idx: number) => (
                <div key={idx} style={{marginTop: "8px",padding: "10px",borderRadius: "10px",border: "1px solid #e2e8f0"}}>
                  <p style={{fontSize: "11px",color: "#6b7280",marginBottom: "4px",textTransform: "uppercase"}}>{item.type}</p>
                  <strong style={{ fontSize: "14px" }}>{item.name || item.title}</strong>
                  {(item.price || item.minPrice) && (
                    <p style={{ fontSize: "13px", marginTop: "4px" }}>
                      {(item.price || item.minPrice) + " " + (item.currency || modalData.currency)}
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
