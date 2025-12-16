// @xotiji/config - Centralized Configuration

export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    aiRecommendations: boolean;
    localGuides: boolean;
    gamification: boolean;
    socialShare: boolean;
  };
  api: {
    timeout: number;
    retryAttempts: number;
  };
  supportedLanguages: string[];
}

export const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  environment: (import.meta.env.MODE as any) || 'development',
  features: {
    aiRecommendations: true,
    localGuides: true,
    gamification: true,
    socialShare: true
  },
  api: {
    timeout: 30000,
    retryAttempts: 3
  },
  supportedLanguages: ['tr', 'en', 'ar', 'es']
};

export default config;
