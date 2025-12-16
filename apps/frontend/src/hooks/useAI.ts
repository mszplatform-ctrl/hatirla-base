import { useState } from 'react';
import { t, getLang } from '../i18n';

type AISuggestion = {
  type: "hotel" | "experience" | "flight";
  score: number;
  payload: Record<string, unknown>;
};

type Hotel = {
  id: number;
  name: string;
  minPrice: number | null;
  currency: string | null;
};

type Experience = {
  id: number;
  title: string;
  price: number | null;
  currency: string | null;
};

type PackageSelection = {
  type: string;
  name?: string;
  title?: string;
  price: number | null;
  currency: string | null;
};

const AI_BASE = `${import.meta.env.VITE_API_URL}/api/ai`;

export function useAI() {
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [composeLoading, setComposeLoading] = useState(false);

  async function getSuggestions() {
    try {
      setAiLoading(true);
      setAiSuggestions([]);
      const res = await fetch(`${AI_BASE}/suggestions`);
      const data = await res.json();
      setAiSuggestions(data);
      return data;
    } catch (err) {
      console.error('AI SUGGEST ERROR:', err);
      alert(t('ai.suggestionsError'));
      return [];
    } finally {
      setAiLoading(false);
    }
  }

  async function composePackage(
    selectedHotels: Hotel[],
    selectedExperiences: Experience[]
  ) {
    if (selectedHotels.length + selectedExperiences.length === 0) {
      alert(t('ai.selectAtLeastOne'));
      return null;
    }

    try {
      setComposeLoading(true);
      const selections: PackageSelection[] = [];
      
      selectedHotels.forEach((h) => {
        selections.push({
          type: "hotel",
          name: h.name,
          price: h.minPrice,
          currency: h.currency,
        });
      });
      
      selectedExperiences.forEach((e) => {
        selections.push({
          type: "experience",
          title: e.title,
          price: e.price,
          currency: e.currency,
        });
      });

      // Get user's current language
      const language = getLang();

      const res = await fetch(`${AI_BASE}/compose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections, language }),
      });
      
      const data = await res.json();
      return data.itinerary;
    } catch (err) {
      console.error('AI COMPOSE ERROR:', err);
      alert(t('ai.packageError'));
      return null;
    } finally {
      setComposeLoading(false);
    }
  }

  return {
    aiSuggestions,
    aiLoading,
    composeLoading,
    getSuggestions,
    composePackage,
  };
}