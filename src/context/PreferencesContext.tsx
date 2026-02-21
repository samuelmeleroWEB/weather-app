
import React, { createContext, useState, useContext, type ReactNode } from 'react';
import { translations } from '../i18n/locales';

interface PreferencesContextProps {
  language: 'en' | 'es';
  unit: 'metric' | 'imperial';
  setLanguage: (lang: 'en' | 'es') => void;
  setUnit: (unit: 'metric' | 'imperial') => void;
  translate: (key: string) => string;
  formatTemp: (tempC: number) => string;
}

const PreferencesContext = createContext<PreferencesContextProps | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'es'>('es');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const translate = (key: string) => {
    // @ts-ignore
    const text = translations[language][key];
    return text || key;
  };

  const formatTemp = (tempC: number) => {
    if (unit === 'imperial') {
      const tempF = Math.round((tempC * 9/5) + 32);
      return `${tempF}°F`;
    }
    return `${Math.round(tempC)}°C`;
  };

  return (
    <PreferencesContext.Provider value={{ language, unit, setLanguage, setUnit, translate, formatTemp }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
  return context;
};
