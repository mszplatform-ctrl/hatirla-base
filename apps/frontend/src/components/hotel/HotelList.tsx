import { useLanguage } from "../../i18n/LanguageProvider";
import { t } from "@packages/i18n";
import { HotelCard } from './HotelCard';

type Hotel = {
  id: number;
  name: string;
  description: string | null;
  minPrice: number | null;
  currency: string | null;
};

type HotelListProps = {
  hotels: Hotel[];
  selectedIds: number[];
  onHotelClick: (hotel: Hotel) => void;
  onToggleSelection: (hotel: Hotel) => void;
};

export function HotelList({ hotels, selectedIds, onHotelClick, onToggleSelection }: HotelListProps) {
  useLanguage(); // Re-render için subscribe

  return (
    <div>
      <h3 style={{ fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>
        🏨 {t('home.hotels')} ({hotels.length})
      </h3>
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          isSelected={selectedIds.includes(hotel.id)}
          onCardClick={() => onHotelClick(hotel)}
          onToggleSelection={(e) => {
            e.stopPropagation();
            onToggleSelection(hotel);
          }}
        />
      ))}
    </div>
  );
}