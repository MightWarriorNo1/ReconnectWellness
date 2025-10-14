import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Clock, 
  Award,
  Activity,
  Zap,
  BarChart3,
  Target,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useUserStats } from '../../hooks/useUserStats';
import { useSessions } from '../../hooks/useSessions';
import { ReconnectScore } from '../ui/ReconnectScore';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { StreaksHabitsBar } from '../ui/StreaksHabitsBar';

interface MyDataPageProps {
  sessions?: any[];
  onRefresh?: () => void;
}

interface DimensionData {
  name: string;
  value: number;
  trend: number;
  color: string;
  emoji: string;
}

interface SessionHistoryItem {
  id: string;
  date: string;
  protocolName: string;
  preCalm: number;
  postCalm: number;
  preClarity: number;
  postClarity: number;
  preEnergy: number;
  postEnergy: number;
  sessionQuality: number;
}

export function MyDataPage({ sessions, onRefresh }: MyDataPageProps) {
  const { stats, loading: statsLoading, refetch: refetchStats } = useUserStats();
  const { getUserSessions } = useSessions();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setAllSessions(sessions);
      setLoading(false);
    } else {
      loadSessions();
    }
  }, [sessions]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const sessions = await getUserSessions();
      setAllSessions(sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setAllSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getProtocolName = (protocolId: string) => {
    const protocolNames: Record<string, string> = {
      'presence-drop': 'Presence Drop',
      'back-to-baseline': 'Back to Baseline',
      'peak-focus': 'Peak Focus',
      'reset-recharge': 'Reset & Recharge',
      'calm-center': 'Calm Center',
      'unplug-recover': 'Unplug & Recover'
    };
    return protocolNames[protocolId] || protocolId;
  };

  // Calculate dimension trends
  const calculateDimensionTrends = (): DimensionData[] => {
    const days = timeRange === '7d' ? 7 : 30;
    const recentSessions = allSessions.filter(s => 
      new Date(s.created_at) >= subDays(new Date(), days)
    );

    if (recentSessions.length < 2) {
      return [
        { name: 'Calm', value: stats.calmAverage, trend: 0, color: 'bg-blue-500', emoji: '🟦' },
        { name: 'Clarity', value: stats.clarityAverage, trend: 0, color: 'bg-green-500', emoji: '🟩' },
        { name: 'Energy', value: stats.energyAverage, trend: 0, color: 'bg-orange-500', emoji: '🟧' }
      ];
    }

    // Split sessions into two periods for trend calculation
    const midPoint = Math.floor(recentSessions.length / 2);
    const firstHalf = recentSessions.slice(midPoint);
    const secondHalf = recentSessions.slice(0, midPoint);

    const calculateAverage = (sessions: any[], dimension: string) => {
      const validSessions = sessions.filter(s => s[`post_${dimension.toLowerCase()}`] !== null);
      if (validSessions.length === 0) return 0;
      return validSessions.reduce((sum, s) => sum + (s[`post_${dimension.toLowerCase()}`] || 0), 0) / validSessions.length;
    };

    const calmTrend = calculateAverage(secondHalf, 'calm') - calculateAverage(firstHalf, 'calm');
    const clarityTrend = calculateAverage(secondHalf, 'clarity') - calculateAverage(firstHalf, 'clarity');
    const energyTrend = calculateAverage(secondHalf, 'energy') - calculateAverage(firstHalf, 'energy');

    return [
      { 
        name: 'Calm', 
        value: Math.round(stats.calmAverage), 
        trend: Math.round(calmTrend), 
        color: 'bg-blue-500', 
        emoji: '🟦' 
      },
      { 
        name: 'Clarity', 
        value: Math.round(stats.clarityAverage), 
        trend: Math.round(clarityTrend), 
        color: 'bg-green-500', 
        emoji: '🟩' 
      },
      { 
        name: 'Energy', 
        value: Math.round(stats.energyAverage), 
        trend: Math.round(energyTrend), 
        color: 'bg-orange-500', 
        emoji: '🟧' 
      }
    ];
  };

  // Get session history
  const getSessionHistory = (): SessionHistoryItem[] => {
    return allSessions
      .filter(s => s.completed && s.post_calm !== null)
      .slice(0, 10)
      .map(s => ({
        id: s.id,
        date: s.created_at,
        protocolName: getProtocolName(s.protocol_id),
        preCalm: s.pre_calm || 0,
        postCalm: s.post_calm || 0,
        preClarity: s.pre_clarity || 0,
        postClarity: s.post_clarity || 0,
        preEnergy: s.pre_energy || 0,
        postEnergy: s.post_energy || 0,
        sessionQuality: Math.round(
          ((s.post_calm - s.pre_calm) + (s.post_clarity - s.pre_clarity) + (s.post_energy - s.pre_energy)) / 3
        )
      }));
  };

  // Calculate weekly progress
  const getWeeklyProgress = () => {
    const weekStart = startOfWeek(currentWeek);
    const weekEnd = endOfWeek(currentWeek);
    
    const weekSessions = allSessions.filter(s => 
      isWithinInterval(new Date(s.created_at), { start: weekStart, end: weekEnd })
    );

    // Count unique days with completed sessions
    const completedSessionDates = weekSessions
      .filter(s => s.completed)
      .map(s => new Date(s.created_at).toDateString());
    
    const uniqueDaysWithSessions = new Set(completedSessionDates).size;
    const totalDays = 7;

    return {
      completed: uniqueDaysWithSessions,
      total: totalDays,
      percentage: Math.min(100, Math.round((uniqueDaysWithSessions / totalDays) * 100))
    };
  };

  const dimensionData = calculateDimensionTrends();
  const sessionHistory = getSessionHistory();
  const weeklyProgress = getWeeklyProgress();

  const handleRefresh = async () => {
    await loadSessions();
    await refetchStats();
    setRefreshTrigger(prev => prev + 1);
    onRefresh?.();
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600 dark:text-green-400';
    if (trend < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-between items-start mb-8"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your wellness journey and progress
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* 1. Reconnect Score Trend */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reconnect Score Trend
          </h3>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeRange === '7d'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeRange === '30d'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
        
        <ReconnectScore
          calm={stats.calmAverage}
          clarity={stats.clarityAverage}
          energy={stats.energyAverage}
          reconnectScore={stats.reconnectScore}
          sessionQualities={stats.sessionQualities}
          consistencyBonus={stats.consistencyBonus}
          weeklyResetsCount={stats.weeklyResetsCount}
          inactivityPenalty={stats.inactivityPenalty}
          daysSinceLastSession={stats.daysSinceLastSession}
          showRecentSessions={true}
        />
      </motion.section>

      {/* 2. Dimension Breakdown */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Dimension Breakdown
        </h3>
        
        <div className="space-y-4">
          {dimensionData.map((dimension, index) => (
            <motion.div
              key={dimension.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{dimension.emoji}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {dimension.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current average
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dimension.value}
                  </div>
                  <div className={`text-sm font-medium flex items-center gap-1 ${getTrendColor(dimension.trend)}`}>
                    {getTrendIcon(dimension.trend)}
                    {dimension.trend > 0 ? '+' : ''}{dimension.trend}%
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${dimension.color} rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(dimension.value, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. Session History */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Session History
        </h3>
        
        <div className="space-y-4">
          {sessionHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No completed sessions yet</p>
              <p className="text-sm">Complete your first session to see your history here</p>
            </div>
          ) : (
            sessionHistory.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {session.protocolName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(session.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {session.sessionQuality}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Quality Score
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-blue-600 dark:text-blue-400">Calm</div>
                    <div className="text-gray-900 dark:text-white">
                      {session.preCalm} → {session.postCalm}
                    </div>
                    <div className={`text-xs ${session.postCalm > session.preCalm ? 'text-green-600' : 'text-red-600'}`}>
                      {session.postCalm > session.preCalm ? '+' : ''}{session.postCalm - session.preCalm}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600 dark:text-green-400">Clarity</div>
                    <div className="text-gray-900 dark:text-white">
                      {session.preClarity} → {session.postClarity}
                    </div>
                    <div className={`text-xs ${session.postClarity > session.preClarity ? 'text-green-600' : 'text-red-600'}`}>
                      {session.postClarity > session.preClarity ? '+' : ''}{session.postClarity - session.preClarity}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-orange-600 dark:text-orange-400">Energy</div>
                    <div className="text-gray-900 dark:text-white">
                      {session.preEnergy} → {session.postEnergy}
                    </div>
                    <div className={`text-xs ${session.postEnergy > session.preEnergy ? 'text-green-600' : 'text-red-600'}`}>
                      {session.postEnergy > session.preEnergy ? '+' : ''}{session.postEnergy - session.preEnergy}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Streaks & Consistency
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeek(subDays(currentWeek, 7))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {format(startOfWeek(currentWeek), 'MMM d')} - {format(endOfWeek(currentWeek), 'MMM d')}
            </span>
            <button
              onClick={() => setCurrentWeek(subDays(currentWeek, -7))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Streak */}
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Current Streak</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Consecutive days</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.currentStreak === 1 ? 'day' : 'days'}
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">This Week</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resets completed</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {weeklyProgress.completed}/{weeklyProgress.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {weeklyProgress.percentage}% complete
            </div>
          </div>
        </div>

        {/* Weekly Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {weeklyProgress.completed} of {weeklyProgress.total} days
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${weeklyProgress.percentage}%` }}
            />
          </div>
        </div>
      </motion.section>

      {/* Streaks & Habits Bar */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8"
      >
        <StreaksHabitsBar refreshTrigger={refreshTrigger} />
      </motion.section>
    </motion.div>
  );
}
