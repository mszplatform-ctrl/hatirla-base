import { t } from '../../i18n';
import { CityCard } from './CityCard';

type CitySummary = {
  id: number;
  name: string;
  countryCode: string;
  hotels: number;
  experiences: number;
};

type CityListProps = {
  cities: CitySummary[];
  selectedCityId: number | null;
  onCityClick: (city: CitySummary) => void;
  loading: boolean;
};

export function CityList({ cities, selectedCityId, onCityClick, loading }: CityListProps) {
  if (loading) {
    return <p>{t('home.citiesLoading')}</p>;
  }

  return (
    <div style={{
      marginTop: "12px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "24px",
      alignItems: "stretch"
    }}>
      {cities.map((city) => (
        <CityCard
          key={city.id}
          city={city}
          isSelected={selectedCityId === city.id}
          onClick={() => onCityClick(city)}
        />
      ))}
    </div>
  );
}