import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSessions } from './useSessions';
import { achievements } from '../data/achievements';
import { UserAchievement } from '../types';

export function useUserAchievements(refreshTrigger?: number) {
  const { user } = useAuth();
  const { getUserSessions } = useSessions();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    calculateAchievements();
  }, [user, refreshTrigger]);

  const calculateAchievements = async () => {
    if (!user) return;

    try {
      // Handle case where Supabase is not configured or fetch fails
      let sessions;
      try {
        sessions = await getUserSessions();
      } catch (fetchError) {
        console.warn('Failed to fetch sessions for achievements:', fetchError);
        // Return empty achievements if we can't fetch sessions
        setUserAchievements([]);
        return;
      }
      
      // Handle case where sessions is null/undefined
      if (!sessions) {
        sessions = [];
      }
      
      const calculatedAchievements: UserAchievement[] = [];

      for (const achievement of achievements) {
        const userAchievement = calculateAchievementProgress(achievement, sessions);
        calculatedAchievements.push(userAchievement);
      }

      setUserAchievements(calculatedAchievements);
    } catch (error) {
      console.error('Error calculating achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAchievementProgress = (achievement: any, sessions: any[]): UserAchievement => {
    const now = new Date();
    let progress = 0;
    let completed = false;
    let completedAt: Date | undefined;

    switch (achievement.id) {
      case 'weekly-reset-streak': {
        // Calculate weekly sessions for current week
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekSessions = sessions.filter(s => 
          new Date(s.created_at) >= weekStart && s.completed
        );

        progress = weekSessions.length;
        completed = progress >= achievement.requirements.count;
        break;
      }

      case 'morning-focus-challenge': {
        // Check for 3 consecutive mornings with focus protocols
        const focusSessions = sessions
          .filter(s => s.protocol_id === 'focus-boost' && s.completed)
          .map(s => new Date(s.created_at))
          .sort((a, b) => b.getTime() - a.getTime());

        let consecutiveDays = 0;
        let maxConsecutive = 0;

        for (let i = 0; i < focusSessions.length; i++) {
          const sessionDate = focusSessions[i];
          const sessionHour = sessionDate.getHours();
          
          // Check if it's a morning session (before 12 PM)
          if (sessionHour < 12) {
            if (i === 0) {
              consecutiveDays = 1;
            } else {
              const prevDate = focusSessions[i - 1];
              const dayDiff = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (dayDiff === 1) {
                consecutiveDays++;
              } else {
                maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
                consecutiveDays = 1;
              }
            }
          }
        }

        maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
        progress = maxConsecutive;
        completed = progress >= achievement.requirements.count;
        break;
      }

      case 'stress-reset-sprint': {
        // Calculate calm sessions in current week
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const calmSessions = sessions.filter(s => 
          s.protocol_id === 'calm-center' && 
          s.completed &&
          new Date(s.created_at) >= weekStart
        );

        progress = calmSessions.length;
        completed = progress >= achievement.requirements.count;
        break;
      }

      case 'team-challenge': {
        // For demo purposes, simulate team progress
        // In a real app, this would query team sessions
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const userMonthlySessions = sessions.filter(s => 
          s.completed && new Date(s.created_at) >= monthStart
        );

        // Simulate team multiplier (user sessions * 5 for demo)
        progress = Math.min(userMonthlySessions.length * 5, achievement.requirements.count);
        completed = progress >= achievement.requirements.count;
        break;
      }

      default:
        progress = 0;
        completed = false;
    }

    if (completed && !completedAt) {
      completedAt = new Date();
    }

    return {
      id: `${user.id}-${achievement.id}`,
      userId: user.id,
      achievementId: achievement.id,
      progress,
      completed,
      completedAt
    };
  };

  return { userAchievements, loading, refetch: calculateAchievements };
}