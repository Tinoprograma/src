export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SONGS: '/songs',
  SONG_DETAIL: '/songs/:id',
  PROFILE: '/profile',
};

export const COLORS = {
  primary: {
    50: '#fef7ee',
    100: '#fdebd3',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
  },
  accent: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
  }
};