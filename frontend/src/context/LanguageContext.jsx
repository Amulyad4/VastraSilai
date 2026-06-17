import React, { createContext, useContext, useState } from 'react';
import { translations } from '../translations/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('vastrasilai_lang') || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('vastrasilai_lang', lang);
  };

  const t = (key, replacements = {}) => {
    const langDict = translations[language] || translations['en'];
    let text = langDict[key] || translations['en'][key] || key;
    
    // Process string replacements (e.g. {name}, {amount})
    Object.keys(replacements).forEach((placeholder) => {
      text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
