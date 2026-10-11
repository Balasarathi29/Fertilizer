import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, translations } from './translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('bhoomiBloomLanguage');
    return stored && translations[stored] ? stored : 'en';
  });

  const changeLanguage = (code) => {
    if (translations[code]) {
      setLanguage(code);
      localStorage.setItem('bhoomiBloomLanguage', code);
    }
  };

  const t = (keyPath, fallback = '') => {
    if (!keyPath) return fallback;

    const keys = keyPath.split('.');
    
    // 1. Try active language
    let current = translations[language];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }

    if (current !== undefined && typeof current === 'string') {
      return current;
    }

    // 2. Fallback to English
    let english = translations['en'];
    for (const k of keys) {
      if (english && english[k] !== undefined) {
        english = english[k];
      } else {
        english = undefined;
        break;
      }
    }

    if (english !== undefined && typeof english === 'string') {
      return english;
    }

    return fallback || keyPath;
  };

  const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        currentLanguageObj,
        LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
