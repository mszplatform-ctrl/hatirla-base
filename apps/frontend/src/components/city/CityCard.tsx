import { t } from '../../i18n';

type CitySummary = {
  id: number;
  name: string;
  countryCode: string;
  hotels: number;
  experiences: number;
};

type CityCardProps = {
  city: CitySummary;
  isSelected: boolean;
  onClick: () => void;
};

export function CityCard({ city, isSelected, onClick }: CityCardProps) {
  return (
    <div
      style={{
        padding: "24px",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
        cursor: "pointer",
        background: isSelected ? "#e6f4ff" : "white",
        transition: "all 0.25s"
      }}
      onClick={onClick}
    >
      <h3 style={{ marginBottom: "10px", fontSize: "20px", fontWeight: 600, color: "#0f172a" }}>
        {city.name}
      </h3>
      <p style={{ margin: "4px 0", fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>
        {t('home.country')}: {city.countryCode}
      </p>
      <p style={{ margin: "4px 0", fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>
        🏨 {t('home.hotels')}: {city.hotels}
      </p>
      <p style={{ margin: "4px 0", fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>
        🎭 {t('home.experiences')}: {city.experiences}
      </p>
    </div>
  );
}