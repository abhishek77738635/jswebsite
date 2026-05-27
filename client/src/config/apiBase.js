const API_BASE_URL = 'https://jswebsite-server.vercel.app/api';

/**
 * Always use deployed API (local + production). Never localhost.
 */
export function getApiBaseUrl() {
  const fromEnv = process.env.REACT_APP_API_URL?.trim().replace(/\/$/, '');

  if (fromEnv && !fromEnv.includes('localhost') && !fromEnv.startsWith('/')) {
    return fromEnv;
  }

  return API_BASE_URL;
}
