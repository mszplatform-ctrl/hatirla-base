/**
 * API Configuration
 * Axios instance with language support
 */

import axios from 'axios';
import { getLang } from '../i18n';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
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