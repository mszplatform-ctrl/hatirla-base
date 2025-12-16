import { t } from '../../i18n';

type Hotel = {
  id: number;
  name: string;
  description: string | null;
  minPrice: number | null;
  currency: string | null;
};

type HotelCardProps = {
  hotel: Hotel;
  isSelected: boolean;
  onCardClick: () => void;
  onToggleSelection: (e: React.MouseEvent) => void;
};

export function HotelCard({ hotel, isSelected, onCardClick, onToggleSelection }: HotelCardProps) {
  return (
    <div
      style={{
        marginTop: "12px",
        padding: "14px 16px",
        borderRadius: "12px",
        border: isSelected ? "2px solid #0f766e" : "1px solid #e2e8f0",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        background: isSelected ? "#ecfdf5" : "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
      onClick={onCardClick}
    >
      <div>
        <strong style={{ color: "#0f172a" }}>{hotel.name}</strong>
        {hotel.minPrice && (
          <p style={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>
            {t('home.startingPrice')}: {hotel.minPrice} {hotel.currency}
          </p>
        )}
      </div>
      <button
        onClick={onToggleSelection}
        style={{
          fontSize: "11px",
          padding: "6px 10px",
          borderRadius: "999px",
          border: "1px solid #0f766e",
          background: isSelected ? "#0f766e" : "white",
          color: isSelected ? "white" : "#0f766e",
          cursor: "pointer"
        }}
      >
        {isSelected ? t('home.removeFromPackage') : t('home.addToPackage')}
      </button>
    </div>
  );
}