import { useState } from 'react';
import { getLang } from '../i18n';

type Hotel = {
  id: number;
  name: string;
  name_tr: string | null;
  description: string | null;
  minPrice: number | null;
  currency: string | null;
};

type Experience = {
  id: number;
  title: string;
  title_tr: string | null;
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
      const lang = getLang();
      const [hotelsRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/hotels?city=${encodeURIComponent(city.name)}&lang=${lang}`),
        fetch(`${API_BASE}/experiences?city=${encodeURIComponent(city.name)}&lang=${lang}`),
      ]);

      if (!hotelsRes.ok) throw new Error(`HTTP error ${hotelsRes.status}`);
      if (!expRes.ok) throw new Error(`HTTP error ${expRes.status}`);
      const hotelsJson = await hotelsRes.json();
      const expJson = await expRes.json();

      // Backend returns { success, data: { hotels: [], count } }
      const rawHotels: any[] = hotelsJson.data?.hotels ?? hotelsJson.data ?? [];
      const rawExp: any[] = expJson.data?.experiences ?? expJson.data ?? [];

      setHotels(
        rawHotels
          .map((h: any, i: number) => ({
            id: h.id ?? i + 1,
            name: h.name,
            name_tr: h.name_tr ?? null,
            description: (h.description ?? '').replace(/^\[beta_seed\]\s*/i, '') || null,
            minPrice: h.price_per_night ?? h.minPrice ?? null,
            currency: h.currency ?? null,
          }))
      );

      setExperiences(
        rawExp
          .map((e: any, i: number) => ({
            id: e.id ?? i + 1,
            title: e.title,
            title_tr: e.title_tr ?? null,
            description: (e.description ?? '').replace(/^\[beta_seed\]\s*/i, '') || null,
            price: e.price ?? null,
            currency: e.currency ?? null,
            category: e.category ?? null,
          }))
      );
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