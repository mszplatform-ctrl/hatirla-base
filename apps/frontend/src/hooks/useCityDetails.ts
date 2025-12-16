import { useState } from 'react';

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

type CitySummary = {
  id: number;
  name: string;
  countryCode: string;
  hotels: number;
  experiences: number;
};

const API_BASE = `${import.meta.env.VITE_API_URL}/api/data`;

export function useCityDetails() {
  const [selectedCity, setSelectedCity] = useState<CitySummary | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotelIds, setSelectedHotelIds] = useState<number[]>([]);
  const [selectedExperienceIds, setSelectedExperienceIds] = useState<number[]>([]);

  async function loadCityDetails(city: CitySummary) {
    setSelectedCity(city);
    setLoading(true);
    setHotels([]);
    setExperiences([]);
    setSelectedHotelIds([]);
    setSelectedExperienceIds([]);

    try {
      const [hotelsRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/hotels?cityId=${city.id}`),
        fetch(`${API_BASE}/experiences?cityId=${city.id}`),
      ]);

      setHotels(await hotelsRes.json());
      setExperiences(await expRes.json());
    } catch (err) {
      console.error('DETAIL FETCH ERROR:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleHotelSelection(hotelId: number) {
    setSelectedHotelIds((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
  }

  function toggleExperienceSelection(expId: number) {
    setSelectedExperienceIds((prev) =>
      prev.includes(expId) ? prev.filter((id) => id !== expId) : [...prev, expId]
    );
  }

  return {
    selectedCity,
    hotels,
    experiences,
    loading,
    selectedHotelIds,
    selectedExperienceIds,
    loadCityDetails,
    toggleHotelSelection,
    toggleExperienceSelection,
  };
}