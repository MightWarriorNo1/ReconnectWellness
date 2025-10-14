import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Error parsing favorites:', error);
          setFavorites([]);
        }
      }
    }
  }, [user]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const toggleFavorite = (protocolId: string) => {
    setFavorites(prev => {
      if (prev.includes(protocolId)) {
        return prev.filter(id => id !== protocolId);
      } else {
        return [...prev, protocolId];
      }
    });
  };

  const isFavorite = (protocolId: string) => {
    return favorites.includes(protocolId);
  };

  const addFavorite = (protocolId: string) => {
    if (!favorites.includes(protocolId)) {
      setFavorites(prev => [...prev, protocolId]);
    }
  };

  const removeFavorite = (protocolId: string) => {
    setFavorites(prev => prev.filter(id => id !== protocolId));
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite
  };
}
