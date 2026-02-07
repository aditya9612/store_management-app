import React, { createContext, useState, useEffect } from 'react';
import { authService } from '@/utils/api';
import { translations } from '@/constants/translations';

const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get owner_id from localStorage
    const ownerId = localStorage.getItem('owner_id');
    
    if (ownerId) {
      // Fetch language preference from backend
      authService.getOwnerLanguage(ownerId)
        .then(response => {
          const lang = response.data?.preferred_language || 'en';
          setLanguage(lang);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching language preference:', error);
          setLanguage('en');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const changeLanguage = async (newLanguage) => {
    const ownerId = localStorage.getItem('owner_id');
    
    if (!ownerId) {
      setLanguage(newLanguage);
      return;
    }

    try {
      // Update language preference in backend
      await authService.updateOwnerLanguage(ownerId, newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error updating language preference:', error);
      // Still update locally even if backend fails
      setLanguage(newLanguage);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
export { LanguageProvider };

