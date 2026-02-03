import { useState, useEffect } from 'react';

type CitySummary = {
  id: number;
  name: string;
  countryCode: string;
  hotels: number;
  experiences: number;
};

const API_BASE = `${import.meta.env.VITE_API_URL}/api/data`;

export function useCities() {
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch(`${API_BASE}/cities`);
        const json = await res.json();
        
        // Backend response: { success, data }
        setCities(json.data ?? []);
      } catch (err) {
        console.error('CITY FETCH ERROR:', err);
        setError('Failed to fetch cities');
      } finally {
        setLoading(false);
      }
    }
    fetchCities();
  }, []);

  return { cities, loading, error };
}