import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award,
  Activity,
  Zap
} from 'lucide-react';
import { useUserStats } from '../../hooks/useUserStats';
import { useSessions } from '../../hooks/useSessions';
import { MetricCard } from './MetricCard';
import { ReconnectScore } from './ReconnectScore';
import { StreaksHabitsBar } from './StreaksHabitsBar';
import { format } from 'date-fns';

interface DataViewProps {
  sessions?: any[];
  onRefresh?: () => void;
}

export function DataView({ sessions, onRefresh }: DataViewProps) {
  const { stats, loading: statsLoading } = useUserStats();
  const { getUserSessions } = useSessions();
  const [recentSessions, setRecentSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (sessions && sessions.length > 0) {
      // Use sessions passed from parent if available
      setRecentSessions(sessions.slice(0, 5));
      setLoading(false);
    } else {
      // Fallback to loading from API
      loadRecentSessions();
    }
  }, [sessions]);

  const loadRecentSessions = async () => {
    try {
      const sessions = await getUserSessions(5);
      setRecentSessions(sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setRecentSessions([]);
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
      'unplug-recover': 'Unplug & Recover'
    };
    return protocolNames[protocolId] || protocolId;
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
      className="space-y-8"
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
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Refresh
          </button>
        )}
      </motion.div>

      {/* Reconnect Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
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
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-8"
      >
        <StreaksHabitsBar />
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MetricCard
          title="Total Sessions"
          value={stats.totalSessions.toString()}
          icon={Calendar}
          color="bg-blue-500"
        />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <MetricCard
          title="Current Streak"
          value={stats.currentStreak.toString()}
          subtitle="days"
          icon={Award}
          color="bg-green-500"
        />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <MetricCard
          title="This Week"
          value={stats.weeklyResets.toString()}
          subtitle="sessions"
          icon={TrendingUp}
          color="bg-purple-500"
        />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <MetricCard
          title="Total Minutes"
          value={Math.round(stats.totalMinutes || 0).toString()}
          subtitle="minutes"
          icon={Clock}
          color="bg-orange-500"
        />
        </motion.div>
      </motion.div>

      {/* Wellness Averages */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-teal-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Wellness Averages
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <motion.div 
              className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.calmAverage}
              </div>
            </motion.div>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Calm</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Average post-session</div>
          </div>

          <div className="text-center">
            <motion.div 
              className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.clarityAverage}
              </div>
            </motion.div>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Clarity</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Average post-session</div>
          </div>

          <div className="text-center">
            <motion.div 
              className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.energyAverage}
              </div>
            </motion.div>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Energy</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Average post-session</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-teal-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Sessions
            </h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Latest 5 sessions
          </span>
        </div>

        {recentSessions.length > 0 ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            {recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Zap className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {getProtocolName(session.protocol_id)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(session.created_at), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                </div>

                {session.completed && (
                  <div className="flex space-x-3 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        {session.post_calm || 0}
                      </div>
                      <div className="text-xs text-gray-500">Calm</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600 dark:text-green-400">
                        {session.post_clarity || 0}
                      </div>
                      <div className="text-xs text-gray-500">Clarity</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-orange-600 dark:text-orange-400">
                        {session.post_energy || 0}
                      </div>
                      <div className="text-xs text-gray-500">Energy</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No sessions yet. Start your first session to see your progress here!
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}