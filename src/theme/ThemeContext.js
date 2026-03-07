import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceInput: '#F8F8F8',
  surfaceCard: '#FFFFFF',
  surface2: '#F8F8F8',
  border: '#EBEBEB',
  textPrimary: '#0C0C0C',
  textSecondary: '#6B6B6B',
  textMuted: '#B8B8B8',
  accent: '#2EBD8F',
  accentDark: '#1A9E73',
  accentPaleBg: '#E8F8F2',
  accentSoftBorder: '#C8EFE1',
  danger: '#E5484D',
  dangerPale: '#FFF0F0',
  amber: '#F5A623',
  amberPale: '#FFF8EC',
  white: '#FFFFFF',
  black: '#000000',
  navBg: 'rgba(255,255,255,0.85)',
  phoneShadow: 'rgba(0,0,0,0.12)',
};

const darkColors = {
  background: '#111111',
  surface: '#1C1C1C',
  surfaceInput: '#1C1C1C',
  surfaceCard: '#1C1C1C',
  surface2: '#242424',
  border: '#2E2E2E',
  textPrimary: '#F0F0F0',
  textSecondary: '#A0A0A0',
  textMuted: '#606060',
  accent: '#2EBD8F',
  accentDark: '#1A9E73',
  accentPaleBg: 'rgba(46,189,143,0.10)',
  accentSoftBorder: 'rgba(46,189,143,0.20)',
  danger: '#E5484D',
  dangerPale: 'rgba(229,72,77,0.12)',
  amber: '#F5A623',
  amberPale: 'rgba(245,166,35,0.12)',
  white: '#FFFFFF',
  black: '#000000',
  navBg: 'rgba(17,17,17,0.85)',
  phoneShadow: 'rgba(0,0,0,0.7)',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('medaura_theme');
        if (saved === 'dark') setIsDark(true);
      } catch (e) {
        // ignore
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem('medaura_theme', next ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export { lightColors, darkColors };
