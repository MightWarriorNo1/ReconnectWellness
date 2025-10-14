import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSessions } from './useSessions';
import { AudioProtocol } from '../types';
import { audioProtocols } from '../data/protocols';

export function useRecentActivity() {
  const { user } = useAuth();
  const { getUserSessions } = useSessions();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [suggestedProtocols, setSuggestedProtocols] = useState<AudioProtocol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentActivity();
    }
  }, [user]);

  const loadRecentActivity = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const sessions = await getUserSessions(10); // Get last 10 sessions
      setRecentSessions(sessions || []);
      
      // Generate suggestions based on recent activity
      const suggestions = generateSuggestions(sessions || []);
      setSuggestedProtocols(suggestions);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      setRecentSessions([]);
      setSuggestedProtocols([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (sessions: any[]): AudioProtocol[] => {
    if (sessions.length === 0) {
      // If no sessions, suggest based on time of day
      return getTimeBasedSuggestions();
    }

    const suggestions: AudioProtocol[] = [];
    
    // Get the most recent session
    const lastSession = sessions[0];
    const lastProtocol = audioProtocols.find(p => p.id === lastSession.protocol_id);
    
    if (lastProtocol) {
      // Suggest complementary protocols based on last session
      const complementary = getComplementaryProtocols(lastProtocol);
      suggestions.push(...complementary);
    }

    // Check for patterns in recent sessions
    const recentCategories = sessions.slice(0, 3).map(s => s.protocol_id);
    const categoryCounts = recentCategories.reduce((acc: Record<string, number>, protocolId) => {
      const protocol = audioProtocols.find(p => p.id === protocolId);
      if (protocol) {
        acc[protocol.category] = (acc[protocol.category] || 0) + 1;
      }
      return acc;
    }, {});

    // Suggest protocols for underrepresented categories
    const allCategories = ['focus', 'energy', 'calm', 'reset'];
    allCategories.forEach(category => {
      if (!categoryCounts[category] || categoryCounts[category] < 2) {
        const protocol = audioProtocols.find(p => p.category === category);
        if (protocol && !suggestions.includes(protocol)) {
          suggestions.push(protocol);
        }
      }
    });

    // Limit to 3 suggestions
    return suggestions.slice(0, 3);
  };

  const getComplementaryProtocols = (lastProtocol: AudioProtocol): AudioProtocol[] => {
    const complementary: AudioProtocol[] = [];
    
    switch (lastProtocol.category) {
      case 'focus':
        // After focus, suggest calm or energy
        const calmProtocol = audioProtocols.find(p => p.category === 'calm');
        const energyProtocol = audioProtocols.find(p => p.category === 'energy');
        if (calmProtocol) complementary.push(calmProtocol);
        if (energyProtocol) complementary.push(energyProtocol);
        break;
      case 'energy':
        // After energy, suggest focus or calm
        const focusProtocol = audioProtocols.find(p => p.category === 'focus');
        const calmProtocol2 = audioProtocols.find(p => p.category === 'calm');
        if (focusProtocol) complementary.push(focusProtocol);
        if (calmProtocol2) complementary.push(calmProtocol2);
        break;
      case 'calm':
        // After calm, suggest focus or reset
        const focusProtocol2 = audioProtocols.find(p => p.category === 'focus');
        const resetProtocol = audioProtocols.find(p => p.category === 'reset');
        if (focusProtocol2) complementary.push(focusProtocol2);
        if (resetProtocol) complementary.push(resetProtocol);
        break;
      case 'reset':
        // After reset, suggest focus or calm
        const focusProtocol3 = audioProtocols.find(p => p.category === 'focus');
        const calmProtocol3 = audioProtocols.find(p => p.category === 'calm');
        if (focusProtocol3) complementary.push(focusProtocol3);
        if (calmProtocol3) complementary.push(calmProtocol3);
        break;
    }
    
    return complementary;
  };

  const getTimeBasedSuggestions = (): AudioProtocol[] => {
    const hour = new Date().getHours();
    const suggestions: AudioProtocol[] = [];
    
    if (hour >= 5 && hour < 9) {
      // Early morning: Focus and Reset
      const focusProtocol = audioProtocols.find(p => p.category === 'focus');
      const resetProtocol = audioProtocols.find(p => p.category === 'reset');
      if (focusProtocol) suggestions.push(focusProtocol);
      if (resetProtocol) suggestions.push(resetProtocol);
    } else if (hour >= 9 && hour < 12) {
      // Late morning: Focus and Energy
      const focusProtocol = audioProtocols.find(p => p.category === 'focus');
      const energyProtocol = audioProtocols.find(p => p.category === 'energy');
      if (focusProtocol) suggestions.push(focusProtocol);
      if (energyProtocol) suggestions.push(energyProtocol);
    } else if (hour >= 12 && hour < 15) {
      // Afternoon: Energy and Reset
      const energyProtocol = audioProtocols.find(p => p.category === 'energy');
      const resetProtocol = audioProtocols.find(p => p.category === 'reset');
      if (energyProtocol) suggestions.push(energyProtocol);
      if (resetProtocol) suggestions.push(resetProtocol);
    } else if (hour >= 15 && hour < 18) {
      // Late afternoon: Focus and Energy
      const focusProtocol = audioProtocols.find(p => p.category === 'focus');
      const energyProtocol = audioProtocols.find(p => p.category === 'energy');
      if (focusProtocol) suggestions.push(focusProtocol);
      if (energyProtocol) suggestions.push(energyProtocol);
    } else {
      // Evening: Calm and Reset
      const calmProtocol = audioProtocols.find(p => p.category === 'calm');
      const resetProtocol = audioProtocols.find(p => p.category === 'reset');
      if (calmProtocol) suggestions.push(calmProtocol);
      if (resetProtocol) suggestions.push(resetProtocol);
    }
    
    return suggestions.slice(0, 2);
  };

  const getSuggestionReason = (protocol: AudioProtocol): string => {
    if (recentSessions.length === 0) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return "Perfect for your morning routine";
      if (hour >= 12 && hour < 18) return "Great for afternoon productivity";
      return "Ideal for evening wind-down";
    }

    const lastSession = recentSessions[0];
    const lastProtocol = audioProtocols.find(p => p.id === lastSession.protocol_id);
    
    if (lastProtocol) {
      switch (lastProtocol.category) {
        case 'focus':
          return `After ${lastProtocol.title} → try this for balance`;
        case 'energy':
          return `After ${lastProtocol.title} → try this for focus`;
        case 'calm':
          return `After ${lastProtocol.title} → try this for productivity`;
        case 'reset':
          return `After ${lastProtocol.title} → try this for focus`;
        default:
          return "Based on your recent activity";
      }
    }
    
    return "Based on your recent activity";
  };

  return {
    recentSessions,
    suggestedProtocols,
    loading,
    getSuggestionReason,
    refresh: loadRecentActivity
  };
}
