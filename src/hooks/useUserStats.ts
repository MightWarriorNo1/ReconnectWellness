import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserStats } from '../types';
import { audioProtocols } from '../data/protocols';

export function useUserStats(refreshTrigger?: number) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    currentStreak: 0,
    weeklyResets: 0,
    completionRate: 0,
    totalSessions: 0,
    reconnectScore: 0,
    calmAverage: 0,
    clarityAverage: 0,
    energyAverage: 0,
    totalMinutes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchUserStats();
  }, [user, refreshTrigger]);

  const fetchUserStats = async () => {
    if (!user) return;

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'https://your-project-ref.supabase.co' || 
        supabaseAnonKey === 'your-anon-key-here' ||
        !supabaseUrl.includes('supabase.co')) {
      console.warn('⚠️ Supabase not configured properly. Using default stats.');
      setLoading(false);
      return;
    }

    try {
      // Test connection first with a simple query
      const connectionTest = await Promise.race([
        supabase.from('sessions').select('id').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);

      // Fetch all completed sessions for the user
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('created_at', { ascending: false });

      console.log('Fetched sessions for stats:', sessions?.length, 'sessions');

      if (error) {
        console.warn('Error fetching sessions:', error);
        // Don't throw here, just use default stats
        setLoading(false);
        return;
      }

      if (!sessions || sessions.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate stats
      const totalSessions = sessions.length;
      
      // Calculate averages for post-session scores
      const completedSessions = sessions.filter(s => 
        s.post_calm !== null && s.post_clarity !== null && s.post_energy !== null
      );

      const calmAverage = completedSessions.length > 0 
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.post_calm || 0), 0) / completedSessions.length)
        : 0;

      const clarityAverage = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.post_clarity || 0), 0) / completedSessions.length)
        : 0;

      const energyAverage = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.post_energy || 0), 0) / completedSessions.length)
        : 0;

      // Calculate total minutes
      const totalMinutes = sessions.reduce((sum, session) => {
        const protocol = audioProtocols.find(p => p.id === session.protocol_id);
        return sum + (protocol?.duration || 0);
      }, 0);

      // Calculate current streak
      const currentStreak = calculateStreak(sessions);

      // Calculate weekly resets (sessions this week)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weeklyResets = sessions.filter(s => 
        new Date(s.created_at) >= weekStart
      ).length;

      // Calculate completion rate (sessions completed vs started)
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('completed')
        .eq('user_id', user.id);

      const completionRate = allSessions && allSessions.length > 0
        ? Math.round((sessions.length / allSessions.length) * 100)
        : 0;

      // Calculate reconnect score (average of the three metrics)
      const reconnectData = calculateReconnectScore(sessions);

      setStats({
        currentStreak,
        weeklyResets,
        completionRate,
        totalSessions,
        reconnectScore: reconnectData.score,
        calmAverage,
        clarityAverage,
        energyAverage,
        totalMinutes,
        sessionQualities: reconnectData.sessionQualities,
        consistencyBonus: reconnectData.consistencyBonus,
        weeklyResetsCount: reconnectData.weeklyResets
      });

    } catch (error) {
      console.warn('Failed to fetch user stats from Supabase:', error);
      console.warn('This is likely due to network connectivity or Supabase configuration issues.');
      console.warn('Using default stats. Please check your Supabase configuration and network connection.');
      
      // Set default stats instead of leaving them empty
      setStats({
        currentStreak: 0,
        weeklyResets: 0,
        completionRate: 0,
        totalSessions: 0,
        reconnectScore: 0,
        calmAverage: 0,
        clarityAverage: 0,
        energyAverage: 0,
        totalMinutes: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateReconnectScore = (sessions: any[]) => {
    if (sessions.length === 0) return { score: 0, sessionQualities: [], consistencyBonus: 0, weeklyResets: 0 };

    // Filter completed sessions with both pre and post scores
    const completedSessions = sessions.filter(s => 
      s.completed &&
      s.pre_calm !== null && s.post_calm !== null &&
      s.pre_clarity !== null && s.post_clarity !== null &&
      s.pre_energy !== null && s.post_energy !== null
    );

    if (completedSessions.length === 0) return { score: 0, sessionQualities: [], consistencyBonus: 0, weeklyResets: 0 };

    // Calculate session quality for each session (0-100)
    const sessionQualities = completedSessions.map(session => {
      // For each dimension: 50% post level + 50% improvement
      const calmPost = (session.post_calm || 0) * 10; // Convert 1-10 to 0-100
      const calmImprovement = Math.max(0, (session.post_calm || 0) - (session.pre_calm || 0)) * 10;
      const calmScore = (calmPost * 0.5 + calmImprovement * 0.5);

      const clarityPost = (session.post_clarity || 0) * 10;
      const clarityImprovement = Math.max(0, (session.post_clarity || 0) - (session.pre_clarity || 0)) * 10;
      const clarityScore = (clarityPost * 0.5 + clarityImprovement * 0.5);

      const energyPost = (session.post_energy || 0) * 10;
      const energyImprovement = Math.max(0, (session.post_energy || 0) - (session.pre_energy || 0)) * 10;
      const energyScore = (energyPost * 0.5 + energyImprovement * 0.5);

      // Average across the three dimensions for session quality (0-100)
      const sessionQuality = (calmScore + clarityScore + energyScore) / 3;
      
      return {
        sessionQuality: Math.round(sessionQuality),
        date: session.created_at,
        id: session.id,
        preCalm: session.pre_calm || 0,
        postCalm: session.post_calm || 0,
        preClarity: session.pre_clarity || 0,
        postClarity: session.post_clarity || 0,
        preEnergy: session.pre_energy || 0,
        postEnergy: session.post_energy || 0
      };
    });

    // Use latest 5 sessions for global reconnect score (or all if less than 5)
    // Note: sessions are fetched in created_at DESC order, so take the first 5
    const recentSessions = sessionQualities.slice(0, 5);
    const baseScore = recentSessions.reduce((sum, item) => sum + item.sessionQuality, 0) / recentSessions.length;
    
    console.log('Reconnect score calculation:', {
      totalSessions: completedSessions.length,
      recentSessionsCount: recentSessions.length,
      baseScore: Math.round(baseScore),
      sessionQualities: recentSessions.map(s => ({ quality: s.sessionQuality, date: s.date }))
    });

    // Calculate inactivity penalty
    const now = new Date();
    const lastSessionDate = completedSessions.length > 0 
      ? new Date(completedSessions[0].created_at) // sessions are ordered by created_at desc
      : null;
    
    let inactivityPenalty = 0;
    if (lastSessionDate) {
      const daysSinceLastSession = Math.floor((now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastSession >= 3) {
        // Apply penalty: 5 points per day after 3 days, max 30 points penalty
        const penaltyDays = Math.min(daysSinceLastSession - 2, 6); // Cap at 6 penalty days
        inactivityPenalty = penaltyDays * 5;
      }
    }
    // Calculate consistency bonus based on weekly frequency
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyResets = sessions.filter(s => 
      s.completed && new Date(s.created_at) >= weekStart
    ).length;

    let consistencyBonus = 0;
    if (weeklyResets >= 5) {
      consistencyBonus = 10;
    } else if (weeklyResets >= 3) {
      consistencyBonus = 5;
    }
    
    console.log('Consistency bonus calculation:', {
      weeklyResets,
      consistencyBonus
    });

    // Final score with consistency bonus and inactivity penalty (capped between 0-100)
    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore + consistencyBonus - inactivityPenalty)));
    
    console.log('Final reconnect score:', {
      baseScore: Math.round(baseScore),
      consistencyBonus,
      inactivityPenalty,
      finalScore
    });

    return {
      score: finalScore,
      sessionQualities: recentSessions,
      consistencyBonus,
      weeklyResets,
      inactivityPenalty,
      daysSinceLastSession: lastSessionDate ? Math.floor((now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24)) : null
    };
  };
  const calculateStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group sessions by date
    const sessionsByDate = sessions.reduce((acc, session) => {
      const date = new Date(session.created_at);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(session);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate streak from today backwards
    let currentDate = new Date(today);
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (sessionsByDate[dateStr] && sessionsByDate[dateStr].length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  return { stats, loading, refetch: fetchUserStats };
}