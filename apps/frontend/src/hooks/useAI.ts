import { useState } from 'react';
import { t, getLang } from '../i18n';
import { logger } from '../utils/logger';

type AISuggestion = {
  title: string;
  description: string;
  score: number;
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

const AI_BASE = `${import.meta.env.VITE_API_URL || 'https://hatirla-base.onrender.com'}/api/ai`;

export function useAI() {
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [composeLoading, setComposeLoading] = useState(false);

  async function getSuggestions() {
    try {
      setAiLoading(true);
      setAiSuggestions([]);
      const lang = getLang();
      const res = await fetch(`${AI_BASE}/suggestions?lang=${lang}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const suggestions = Array.isArray(data) ? data : [];
      setAiSuggestions(suggestions);
      return suggestions;
    } catch (err) {
      logger.error('AI SUGGEST ERROR:', err);
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
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.itinerary;
    } catch (err) {
      logger.error('AI COMPOSE ERROR:', err);
      alert(t('ai.packageError'));
      return null;
    } finally {
      setComposeLoading(false);
    }
  }

  async function getPackageById(id: string) {
    try {
      const res = await fetch(`${AI_BASE}/packages/${encodeURIComponent(id)}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const pkg = data.package;
      return {
        id: pkg.id,
        totalPrice: pkg.totalPrice,
        currency: pkg.currency,
        items: pkg.items,
        days: pkg.itinerary?.days,
        summary: pkg.itinerary?.summary,
      };
    } catch (err) {
      logger.error('AI GET PACKAGE ERROR:', err);
      alert(t('ai.packageError'));
      return null;
    }
  }

  return {
    aiSuggestions,
    aiLoading,
    composeLoading,
    getSuggestions,
    composePackage,
    getPackageById,
  };
}