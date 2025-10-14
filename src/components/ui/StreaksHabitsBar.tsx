import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Target, TrendingUp } from 'lucide-react';
import { useUserStats } from '../../hooks/useUserStats';
import { useSessions } from '../../hooks/useSessions';
import { useAuth } from '../../contexts/AuthContext';

interface StreaksHabitsBarProps {
  className?: string;
  refreshTrigger?: number;
}

export function StreaksHabitsBar({ className = '', refreshTrigger }: StreaksHabitsBarProps) {
  const { user } = useAuth();
  const { stats, loading } = useUserStats();
  const { getUserSessions } = useSessions();
  const [localStats, setLocalStats] = React.useState({
    dayStreak: 0,
    weeklyProgress: 0,
    weeklyGoal: 5,
    monthlyConsistency: 0,
    personalBest: 0
  });
  const [localLoading, setLocalLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      calculateLocalStats();
    } else {
      setLocalLoading(false);
    }
  }, [refreshTrigger, stats]);

  const calculateLocalStats = async () => {
    if (!user) {
      setLocalLoading(false);
      return;
    }

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'https://your-project-ref.supabase.co' || 
        supabaseAnonKey === 'your-anon-key-here' ||
        !supabaseUrl.includes('supabase.co')) {
      console.warn('⚠️ Supabase not configured properly. Using default local stats.');
      setLocalStats({
        dayStreak: 0,
        weeklyProgress: 0,
        weeklyGoal: 5,
        monthlyConsistency: 0,
        personalBest: 0
      });
      setLocalLoading(false);
      return;
    }

    try {
      setLocalLoading(true);
      
      // Get fresh session data for the current user only
      let sessions: any[] = [];
      try {
        sessions = (await getUserSessions()) as any[] || [];
        // Double-check that sessions belong to current user
        sessions = sessions.filter(s => s.user_id === user.id);
      } catch (fetchError) {
        console.warn('Failed to fetch sessions (Supabase may not be configured):', fetchError);
        sessions = [];
      }
      
      // For new users with no sessions, return all zeros
      if (sessions.length === 0) {
        setLocalStats({
          dayStreak: 0,
          weeklyProgress: 0,
          weeklyGoal: 7,
          monthlyConsistency: 0,
          personalBest: 0
        });
        setLocalLoading(false);
        return;
      }

      // Calculate day streak (consecutive days with sessions) for current user
      const dayStreak = calculateConsecutiveDayStreak(sessions);
      
      // Calculate weekly progress
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weeklyProgress = sessions.filter(s => 
        s.completed && s.user_id === user.id && new Date(s.created_at) >= weekStart
      ).length;
      
      // Calculate weekly progress as unique days with sessions
      const weeklySessionDates = sessions
        .filter(s => s.completed && s.user_id === user.id && new Date(s.created_at) >= weekStart)
        .map(s => new Date(s.created_at).toDateString());
      
      const uniqueDaysWithSessions = new Set(weeklySessionDates).size;
      
      // Calculate monthly consistency (30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyCompletedSessions = sessions.filter(s => 
        s.completed && s.user_id === user.id && new Date(s.created_at) >= thirtyDaysAgo
      );
      
      // Calculate consistency as percentage of days with sessions in last 30 days
      const uniqueMonthlyDaysWithSessions = new Set(
        monthlyCompletedSessions.map(s => 
          new Date(s.created_at).toDateString()
        )
      ).size;
      
      const monthlyConsistency = Math.round((uniqueMonthlyDaysWithSessions / 30) * 100);
      
      // Calculate personal best streak for current user
      const personalBest = calculateLongestStreak(sessions);
      
      setLocalStats({
        dayStreak,
        weeklyProgress: uniqueDaysWithSessions,
        weeklyGoal: 7,
        monthlyConsistency,
        personalBest
      });
    } catch (error) {
      console.warn('Error calculating local stats (Supabase may not be configured):', error);
      // Fallback to global stats
      setLocalStats({
        dayStreak: stats.currentStreak,
        weeklyProgress: Math.min(7, stats.weeklyResets), // Cap at 7 days max
        weeklyGoal: 7,
        monthlyConsistency: Math.round(stats.completionRate),
        personalBest: stats.currentStreak
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const calculateConsecutiveDayStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;

    const completedSessions = sessions.filter(s => s.completed && s.user_id === user?.id);
    if (completedSessions.length === 0) return 0;

    // Group sessions by date
    const sessionsByDate = completedSessions.reduce((acc, session) => {
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
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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

  const calculateLongestStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;

    const completedSessions = sessions.filter(s => s.completed && s.user_id === user?.id);
    if (completedSessions.length === 0) return 0;

    // Group sessions by date
    const sessionsByDate = completedSessions.reduce((acc, session) => {
      const date = new Date(session.created_at);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(session);
      return acc;
    }, {} as Record<string, any[]>);

    // Get all unique dates and sort them
    const dates = Object.keys(sessionsByDate).sort();
    
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(dates[i - 1]);
        const currentDate = new Date(dates[i]);
        const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    
    return Math.max(maxStreak, currentStreak);
  };

  if (loading || localLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  // Don't render if no user is logged in
  if (!user) {
    return null;
  }
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
          <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Streaks & Habits
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* Day Streak */}
        <motion.div
          className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800 aspect-square flex flex-col justify-center overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex justify-center mb-2">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {localStats.dayStreak}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
            {localStats.dayStreak === 1 ? 'day strong' : 'days strong'}
          </div>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div
          className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 aspect-square flex flex-col justify-center overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex justify-center mb-2">
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {localStats.weeklyProgress}/{localStats.weeklyGoal}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            this week
          </div>
        </motion.div>

        {/* Monthly Consistency */}
        <motion.div
          className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 aspect-square flex flex-col justify-center overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {localStats.monthlyConsistency}%
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            on track this month
          </div>
        </motion.div>

        {/* Personal Best */}
        <motion.div
          className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 aspect-square flex flex-col justify-center overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex justify-center mb-2">
            <Target className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {localStats.personalBest}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            {localStats.personalBest === 1 ? 'day record' : 'day record'}
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 hidden md:block">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Weekly Goal Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.min(100, Math.round((localStats.weeklyProgress / localStats.weeklyGoal) * 100))}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (localStats.weeklyProgress / localStats.weeklyGoal) * 100)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
}