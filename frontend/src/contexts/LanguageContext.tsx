import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  tr: {
    // Navbar
    'nav.home': 'Ana Sayfa',
    'nav.dashboard': 'Dashboard',
    'nav.deposit': 'Yatırma/Çekme',
    'nav.support': 'Destek',
    'nav.newInvestment': 'Yeni Yatırım',
    'nav.login': 'Giriş Yap',
    'nav.register': 'Üye Ol',
    'nav.logout': 'Çıkış',
    'nav.premium': 'PREMIUM',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.deposit': 'Deposit/Withdraw',
    'nav.support': 'Support',
    'nav.newInvestment': 'New Investment',
    'nav.login': 'Login',
    'nav.register': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.premium': 'PREMIUM',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['tr']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
