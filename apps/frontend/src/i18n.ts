/**
 * Frontend i18n Module
 * Connects to backend i18n system
 */

// Supported languages
export const SUPPORTED = ["tr", "en"] as const;
export type Lang = typeof SUPPORTED[number];

/**
 * Get current language from localStorage or default to 'tr'
 */
export function getLang(): Lang {
  const saved = (localStorage.getItem("lang") || "tr").slice(0, 2).toLowerCase();
  return (SUPPORTED as readonly string[]).includes(saved) ? (saved as Lang) : "tr";
}

/**
 * Set current language
 */
export function setLang(lang: Lang): void {
  localStorage.setItem("lang", lang);
}

/**
 * Translations - FULL INLINE (not from backend)
 */
const translations: Record<Lang, any> = {
  tr: {
    common: {
      appName: "XOTIJI",
      welcome: "Hoş geldiniz",
      search: "Ara",
      login: "Giriş Yap",
      logout: "Çıkış Yap",
    },
    hero: {
      tagline: "toward the sun",
      subtitle: "Node bağlandı. Ağa hoş geldin.",
      description: "Dünya genelinde sinyalleri keşfet. Kendi iletimini oluştur.",
      ctaSpaceSelfie: "Sinyal Oluştur",
      ctaExploreCities: "Node'ları Keşfet",
    },
    home: {
      aiTracking: "Akıllı asistan seçimlerini takip ediyor ve paket oluşturmadan önce kısa bir yorum hazırlıyor.",
      aiThinking: "AI düşünüyor...",
      aiGet3Suggestions: "AI'dan 3 öneri al",
      aiLoadingStep1: "Şehirler analiz ediliyor...",
      aiLoadingStep2: "En iyi noktalar bulunuyor...",
      aiLoadingStep3: "Deneyiminiz hazırlanıyor...",
      cities: "Şehirler",
      citiesLoading: "Şehirler yükleniyor...",
      country: "Ülke",
      hotels: "Sinyal",
      experiences: "İletim",
      detailsLoading: "Detaylar yükleniyor...",
      cityDetails: "Detaylar",
      clickForDetails: "Kartlara tıklayarak detay görebilir, pakete ekleyebilir veya çıkarabilirsin.",
      startingPrice: "Başlangıç fiyatı",
      price: "Fiyat",
      addToPackage: "Pakete ekle",
      removeFromPackage: "Paketten çıkar",
      category: "Kategori",
      itemsSelected: "öğe seçildi — AI ile paket oluşturabilirsin.",
      selectItems: "Paket için otel veya deneyim seç.",
      aiCreatingPackage: "AI paket oluşturuyor...",
      createWithAI: "AI ile paket oluştur",
    },
    ai: {
      suggestions: "AI Önerileri",
      noSuggestions: "Şu anda öneri yok.",
      score: "skor",
      packageSummary: "AI Paket Özeti",
      aiComment: "AI'nin kısa yorumu:",
      totalPrice: "Toplam Fiyat",
      suggestionsError: "AI önerileri alınırken bir hata oluştu.",
      packageError: "AI paket oluşturulurken bir hata oluştu.",
      selectAtLeastOne: "Önce en az bir otel veya deneyim seçmelisin.",
      analysisRich: "Oldukça zengin bir seçim yaptın. AI bu verilerle son derece güçlü ve tutarlı bir seyahat planı çıkarabilir.",
      analysisFair: "Fena değil. AI bir plan oluşturabilir ancak birkaç seçim daha eklemek sonuçları güçlendirebilir.",
      analysisLow: "AI bir plan çıkarabilir fakat seçim sayısı düşük. Birkaç ekleme yapman sonuçları belirgin şekilde iyileştirir.",
    },
    footer: {
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      contact: "Contact",
    },
    privacy: {
      backToHome: "Ana Sayfaya Dön",
      lastUpdated: "Son güncelleme",
    },
    terms: {
      backToHome: "Ana Sayfaya Dön",
      lastUpdated: "Son güncelleme",
    },
    contact: {
      backToHome: "Ana Sayfaya Dön",
      title: "İletişim",
      subtitle: "Sorularınız için bize ulaşın.",
      emailLabel: "E-posta",
      socialsLabel: "Sosyal Medya",
      comingSoon: "Yakında",
    },
    intro: {
      button: "TRANSFERİ BAŞLAT",
      initiated: "Transfer başlatıldı... Hoş geldin, Node.",
    },
    spaceSelfie: {
      title: "Space Selfie",
      back: "Geri",
      step1Title: "Şehir Seç",
      step2Title: "Fotoğraf Yükle",
      step3Title: "Oluşturuluyor...",
      step4Title: "Space Selfien Hazır!",
      selectCityPrompt: "Selfini oluşturmak istediğin şehri seç",
      uploadPrompt: "Fotoğrafını yükle veya kamerayla çek",
      chooseFile: "Dosya Seç",
      takePhoto: "Fotoğraf Çek",
      generate: "Space Selfie Oluştur",
      download: "İndir (PNG)",
      shareInstagram: "Instagram'da Paylaş",
      shareX: "X'te Paylaş",
      shareWhatsApp: "WhatsApp'ta Paylaş",
      shareNote: "Paylaşmak için önce indirip kaydet",
      tryAgain: "Yeniden Dene",
      cities: {
        istanbul: "İstanbul",
        paris: "Paris",
        rome: "Roma",
        tokyo: "Tokyo",
        berlin: "Berlin",
        barcelona: "Barselona",
        dubai: "Dubai",
        london: "Londra",
      },
    },
  },
  en: {
    common: {
      appName: "XOTIJI",
      welcome: "Welcome",
      search: "Search",
      login: "Login",
      logout: "Logout",
    },
    hero: {
      tagline: "toward the sun",
      subtitle: "Node connected. Welcome to the network.",
      description: "Explore signals across Earth. Create your own transmission.",
      ctaSpaceSelfie: "Create Signal",
      ctaExploreCities: "Explore Nodes",
    },
    home: {
      aiTracking: "Smart assistant tracks your selections and prepares a brief comment before creating the package.",
      aiThinking: "AI is thinking...",
      aiGet3Suggestions: "Get 3 AI suggestions",
      aiLoadingStep1: "Analyzing cities...",
      aiLoadingStep2: "Finding best spots...",
      aiLoadingStep3: "Crafting your experience...",
      cities: "Cities",
      citiesLoading: "Loading cities...",
      country: "Country",
      hotels: "Signals",
      experiences: "Transmissions",
      detailsLoading: "Loading details...",
      cityDetails: "Details",
      clickForDetails: "Click on cards to view details, add to package, or remove.",
      startingPrice: "Starting price",
      price: "Price",
      addToPackage: "Add to package",
      removeFromPackage: "Remove from package",
      category: "Category",
      itemsSelected: "items selected — You can create a package with AI.",
      selectItems: "Select hotels or experiences for the package.",
      aiCreatingPackage: "AI is creating package...",
      createWithAI: "Create package with AI",
    },
    ai: {
      suggestions: "AI Suggestions",
      noSuggestions: "No suggestions at the moment.",
      score: "score",
      packageSummary: "AI Package Summary",
      aiComment: "AI's brief comment:",
      totalPrice: "Total Price",
      suggestionsError: "An error occurred while getting AI suggestions.",
      packageError: "An error occurred while creating the AI package.",
      selectAtLeastOne: "You must select at least one hotel or experience first.",
      analysisRich: "Great selection. AI can generate a highly consistent and powerful travel plan with these inputs.",
      analysisFair: "Not bad. AI can build a plan, but a few more selections would strengthen the results.",
      analysisLow: "AI can generate a plan, but the selection count is low. A few additions would noticeably improve results.",
    },
    footer: {
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      contact: "Contact",
    },
    privacy: {
      backToHome: "Back to Home",
      lastUpdated: "Last updated",
    },
    terms: {
      backToHome: "Back to Home",
      lastUpdated: "Last updated",
    },
    contact: {
      backToHome: "Back to Home",
      title: "Contact",
      subtitle: "Reach out with any questions.",
      emailLabel: "Email",
      socialsLabel: "Social Media",
      comingSoon: "Coming soon",
    },
    intro: {
      button: "INITIATE TRANSFER",
      initiated: "Transfer initiated... Welcome, Node.",
    },
    spaceSelfie: {
      title: "Space Selfie",
      back: "Back",
      step1Title: "Choose a City",
      step2Title: "Upload Your Photo",
      step3Title: "Creating your Space Selfie...",
      step4Title: "Your Space Selfie is Ready!",
      selectCityPrompt: "Pick the city for your space selfie",
      uploadPrompt: "Upload a photo or take one with your camera",
      chooseFile: "Choose File",
      takePhoto: "Take Photo",
      generate: "Create Space Selfie",
      download: "Download (PNG)",
      shareInstagram: "Share on Instagram",
      shareX: "Share on X",
      shareWhatsApp: "Share on WhatsApp",
      shareNote: "Download first, then share anywhere",
      tryAgain: "Try Again",
      cities: {
        istanbul: "Istanbul",
        paris: "Paris",
        rome: "Rome",
        tokyo: "Tokyo",
        berlin: "Berlin",
        barcelona: "Barcelona",
        dubai: "Dubai",
        london: "London",
      },
    },
  },
};

/**
 * Translate a key
 */
export function t(key: string, lang?: Lang): string {
  const currentLang = lang || getLang();
  const keys = key.split('.');
  let value: any = translations[currentLang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      break;
    }
  }
  
  // Fallback to Turkish if not found
  if (!value && currentLang !== 'tr') {
    return t(key, 'tr');
  }
  
  return value || key;
}

/**
 * Get current language (alias for external use)
 */
export function getCurrentLanguage(): Lang {
  return getLang();
}