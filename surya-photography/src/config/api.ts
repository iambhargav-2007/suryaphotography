const getApiUrl = () => {
  const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  // Remove any trailing slashes
  const cleanUrl = url.replace(/\/+$/, '');
  // If it doesn't end with /api, append it
  if (!cleanUrl.endsWith('/api')) {
    return `${cleanUrl}/api`;
  }
  return cleanUrl;
};

export const API_BASE_URL = getApiUrl();
