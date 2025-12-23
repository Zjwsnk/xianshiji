// API base URL for backend services.
// Prefer configuring via EXPO_PUBLIC_API_BASE_URL to align with Expo's env support.
// For mobile, use computer's IP instead of localhost
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://192.168.240.177:8080';

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
