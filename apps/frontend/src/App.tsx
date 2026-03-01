import { useState, useEffect } from "react";
import MSZ from "./MSZCore";
import "./xotiji-brand.css";
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Modal } from './components/common/Modal';
import { CityList } from './components/city/CityList';
import { HotelList } from './components/hotel/HotelList';
import { ExperienceList } from './components/experience/ExperienceList';
import { AIPackageModal } from './components/ai/AIPackageModal';
import { useCities } from './hooks/useCities';
import { useCityDetails } from './hooks/useCityDetails';
import { useAI } from './hooks/useAI';
import { t, getLang, type Lang } from './i18n';

export default function App() {
  const { cities, loading: loadingCities } = useCities();
  
  const {
    selectedCity,
    hotels,
    experiences,
    loading: loadingDetails,
    selectedHotelIds,
    selectedExperienceIds,
    loadCityDetails,
    toggleHotelSelection,
    toggleExperienceSelection,
  } = useCityDetails();

  const {
    aiSuggestions,
    aiLoading,
    composeLoading,
    getSuggestions,
    composePackage,
  } = useAI();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalType, setModalType] = useState<"hotel" | "experience" | "ai" | "itinerary" | null>(null);
  const [mszComment, setMszComment] = useState<string | null>(null);
  const [lang] = useState<Lang>(getLang);

  // MSZ: Remember selections
  useEffect(() => {
    const items: any[] = [];

    hotels.forEach((h) => {
      if (selectedHotelIds.includes(h.id)) {
        items.push({ type: "hotel", name: h.name, price: h.minPrice });
      }
    });

    experiences.forEach((e) => {
      if (selectedExperienceIds.includes(e.id)) {
        items.push({ type: "experience", title: e.title, price: e.price });
      }
    });

    MSZ.remember("lastSelections", items);
  }, [selectedHotelIds, selectedExperienceIds, hotels, experiences]);

  function openHotelModal(hotel: any) {
    setModalType("hotel");
    setModalData(hotel);
    setModalVisible(true);
  }

  function openExperienceModal(exp: any) {
    setModalType("experience");
    setModalData(exp);
    setModalVisible(true);
  }

  async function handleAiSuggest() {
    const suggestions = await getSuggestions();
    if (suggestions.length > 0) {
      setModalType("ai");
      setModalVisible(true);
    }
  }

  async function handleComposeItinerary() {
    const selectedHotelsArr = hotels.filter((h) => selectedHotelIds.includes(h.id));
    const selectedExpArr = experiences.filter((e) => selectedExperienceIds.includes(e.id));

    const selections: any[] = [];
    selectedHotelsArr.forEach((h) => {
      selections.push({ type: "hotel", name: h.name, price: h.minPrice, currency: h.currency });
    });
    selectedExpArr.forEach((e) => {
      selections.push({ type: "experience", title: e.title, price: e.price, currency: e.currency });
    });

    // MSZ analizi sadece log için
    const analysis = MSZ.analyzeBeforeCompose(selections);

    const itinerary = await composePackage(selectedHotelsArr, selectedExpArr);
    if (itinerary) {
      // Backend'den gelen aiComment'i kullan
      setMszComment(itinerary.aiComment || analysis);
      setModalType("itinerary");
      setModalData(itinerary);
      setModalVisible(true);
    }
  }

  const totalSelected = selectedHotelIds.length + selectedExperienceIds.length;

  return (
    <div style={{
      padding: "40px",
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      background: "#f7fafc",
      width: "100%",
      minHeight: "100vh",
      margin: "0 auto",
      boxSizing: "border-box",
    }}>
      {/* LANGUAGE SWITCHER */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
        <LanguageSwitcher />
      </div>

      {/* HEADER */}
      <Header />

      {/* AI SUGGESTIONS BUTTON */}
      <div style={{
        marginTop: "8px",
        marginBottom: "16px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
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
            whiteSpace: "nowrap"
          }}
        >
          {aiLoading ? t('home.aiThinking') : `✨ ${t('home.aiGet3Suggestions')}`}
        </button>
      </div>

      {/* CITIES LIST */}
      <CityList
        cities={cities}
        selectedCityId={selectedCity?.id || null}
        onCityClick={loadCityDetails}
        loading={loadingCities}
      />

      {/* CITY DETAILS */}
      {selectedCity && (
        <div style={{
          marginTop: "32px",
          padding: "24px",
          borderRadius: "18px",
          background: "white",
          boxShadow: "0 6px 18px rgba(15,23,42,0.08)"
        }}>
          <h2 style={{ marginBottom: "8px", fontSize: "26px", fontWeight: 700, color: "#0f172a" }}>
            🧭 {selectedCity.name} — {t('home.cityDetails')}
          </h2>
          <p style={{ fontSize: "13px", color: "#475569", marginBottom: "12px" }}>
            {t('home.clickForDetails')}
          </p>

          {loadingDetails ? (
            <p>{t('home.detailsLoading')}</p>
          ) : (
            <>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: "28px"
              }}>
                <HotelList
                  hotels={hotels}
                  selectedIds={selectedHotelIds}
                  onHotelClick={openHotelModal}
                  onToggleSelection={(h) => toggleHotelSelection(h.id)}
                />

                <ExperienceList
                  experiences={experiences}
                  selectedIds={selectedExperienceIds}
                  onExperienceClick={openExperienceModal}
                  onToggleSelection={(e) => toggleExperienceSelection(e.id)}
                />
              </div>

              <div style={{
                marginTop: "24px",
                paddingTop: "12px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "13px", color: totalSelected > 0 ? "#0f766e" : "#64748b" }}>
                  {totalSelected > 0 ? `${totalSelected} ${t('home.itemsSelected')}` : t('home.selectItems')}
                </span>
                <button
                  onClick={handleComposeItinerary}
                  disabled={composeLoading || totalSelected === 0}
                  style={{
                    background: composeLoading || totalSelected === 0 ? "#cbd5e1" : "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "999px",
                    cursor: composeLoading || totalSelected === 0 ? "default" : "pointer"
                  }}
                >
                  {composeLoading ? t('home.aiCreatingPackage') : `📦 ${t('home.createWithAI')}`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <AIPackageModal
          modalType={modalType}
          modalData={modalData}
          aiSuggestions={aiSuggestions}
          mszComment={mszComment}
          lang={lang}
        />
      </Modal>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}