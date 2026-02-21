/**
 * API Configuration
 * Axios instance with language support
 */

import axios from 'axios';
import { getLang } from '../i18n';

const API_BASE = import.meta.env.VITE_API_URL || 'https://hatirla-base.onrender.com';

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
});

// Add language to all requests
apiClient.interceptors.request.use((config) => {
  const lang = getLang();
  
  // Add as query parameter
  if (config.url) {
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}lang=${lang}`;
  }
  
  // Also add as header
  config.headers['Accept-Language'] = lang;
  
  return config;
});

export default apiClient;