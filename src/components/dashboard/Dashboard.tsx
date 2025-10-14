import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSessions } from '../../hooks/useSessions';
import { useUserStats } from '../../hooks/useUserStats';
import { useUserAchievements } from '../../hooks/useUserAchievements';
import { SessionModal } from './SessionModal';
import {AchievementsSection} from './AchievementsSection';
import { AchievementCard } from '../ui/AchievementCard';
import { MetricCard } from '../ui/MetricCard';
import { ProtocolCard } from '../ui/ProtocolCard';
import { ReconnectScore } from '../ui/ReconnectScore';
import { MobileNavigation } from '../ui/MobileNavigation';
import { ProtocolLibrary } from '../ui/ProtocolLibrary';
import { MyDataPage } from './MyDataPage';
import { MoreMenu } from '../ui/MoreMenu';
import { ProfilePage } from '../profile/ProfilePage';
import { PreSessionQuiz } from '../ui/PreSessionQuiz';
import { audioProtocols } from '../../data/protocols';
import { getRecommendedProtocols } from '../../utils/protocolRecommendations';
import { 
  Moon, 
  Sun, 
  LogOut, 
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Play
} from 'lucide-react';
import { StreaksHabitsBar } from '../ui/StreaksHabitsBar';
import { achievements } from '../../data/achievements';

// Animation variants for page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4
};

// Stagger animation for cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { getUserSessions, createSession, updateSession } = useSessions();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { stats, loading: statsLoading, refetch: refetchStats } = useUserStats(refreshTrigger);
  const { userAchievements, refetch: refetchAchievements } = useUserAchievements();
  
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('today');
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<{moodData: any, selectedNeed: string} | null>(null);

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const isNewUser = stats.totalSessions === 0;
    const greeting = isNewUser ? 'Welcome' : 'Welcome back';
    
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${greeting.toLowerCase()}`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${greeting.toLowerCase()}`;
    } else if (hour >= 17 && hour < 22) {
      return `Good evening, ${greeting.toLowerCase()}`;
    } else {
      return `Good evening, ${greeting.toLowerCase()}`; // Late night/early morning
    }
  };
  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      setSessionsLoading(true);
      try {
        const sessions = await getUserSessions();
        console.log('fetchSessions: Got', sessions?.length, 'sessions');
        setAllSessions(sessions || []);
      } catch (fetchError) {
        console.warn('Error fetching sessions (Supabase may not be configured):', fetchError);
        setAllSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setAllSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleSessionComplete = async (sessionData: {
    protocolId: string;
    preCalmValue: number;
    preClarityValue: number;
    preEnergyValue: number;
    postCalmValue: number;
    postClarityValue: number;
    postEnergyValue: number;
    duration: number;
    completed: boolean;
  }) => {
    try {
      const session = await createSession({
        protocolId: sessionData.protocolId,
        preCalmValue: sessionData.preCalmValue,
        preClarityValue: sessionData.preClarityValue,
        preEnergyValue: sessionData.preEnergyValue
      });
      if (session && session.id) {
        console.log('Updating session with ID:', session.id);
        const updatedSession = await updateSession(session.id, { 
          postCalmValue: sessionData.postCalmValue,
          postClarityValue: sessionData.postClarityValue,
          postEnergyValue: sessionData.postEnergyValue,
          completed: true, 
          completedAt: new Date()
        });
        console.log('Session updated:', updatedSession);
      }
      
      // Trigger refresh immediately
      setRefreshTrigger(prev => prev + 1);
      
      // Fetch fresh data
      await fetchSessions();
      await refetchStats();
      await refetchAchievements();
      
      // Add a small delay then trigger another refresh to ensure all components update
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 100);
      
      return true; // Return success
    } catch (error) {
      console.error('Error completing session:', error);
      throw error; // Re-throw to let SessionModal handle the error
    }
  };
  const recentSessions = allSessions.slice(0, 5);
  console.log('Dashboard recentSessions:', recentSessions.length, 'sessions', recentSessions.map(s => ({ id: s.id, created_at: s.created_at, completed: s.completed })));
  const recommendedProtocols = getRecommendedProtocols(stats);
  const [showAllProtocols, setShowAllProtocols] = useState(false);
  const [showAllChallengesMobile, setShowAllChallengesMobile] = useState(false);

  

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'data') {
      // Could trigger data refresh here if needed
    }
  };

  const handleStartSession = (moodData: any, selectedNeed: string) => {
    setSessionData({ moodData, selectedNeed });
    // Find the appropriate protocol based on selectedNeed
    const protocol = audioProtocols.find(p => 
      p.category === selectedNeed || 
      (selectedNeed === 'recharge' && p.category === 'energy') ||
      (selectedNeed === 'focus' && p.category === 'focus') ||
      (selectedNeed === 'release' && p.category === 'calm')
    );
    if (protocol) {
      setSelectedProtocolId(protocol.id);
      // Navigate back to today view to show the session modal
      setActiveTab('today');
    }
  };

  const handleSessionCompleted = () => {
    // Handle session completion - could refresh data, show success message, etc.
    console.log('Session completed');
    // Optionally refresh sessions data
    fetchSessions();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'library':
        return (
          <motion.div
            key="library"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ProtocolLibrary onSelectProtocol={(protocol) => setSelectedProtocolId(protocol.id)} />
          </motion.div>
        );
      case 'session':
        return (
          <motion.div
            key="session"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen flex items-center justify-center"
          >
            <PreSessionQuiz
              onClose={() => setActiveTab('today')}
              onStartSession={handleStartSession}
            />
          </motion.div>
        );
      case 'data':
        return (
          <motion.div
            key="data"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <MyDataPage sessions={allSessions} onRefresh={fetchSessions} />
          </motion.div>
        );
      case 'more':
        return (
          <motion.div
            key="more"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <MoreMenu onShowProfile={() => setActiveTab('profile')} />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ProfilePage onBack={() => setActiveTab('today')} sessions={allSessions} onRefresh={fetchSessions} />
          </motion.div>
        );
      default:
        return renderTodayView();
    }
  };

  const renderTodayView = () => (
    <motion.div
      key="today"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* Welcome Section */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {stats.totalSessions === 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 pt-4">
              Welcome, {user?.user_metadata?.full_name || 'Friend'}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to start your wellness journey?
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 pt-4">
              Welcome back, {user?.user_metadata?.full_name || 'Friend'}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to reconnect with yourself today?
            </p>
          </>
        )}
      </motion.div>

      {/* Stats Overview - Hidden on mobile to save space */}
      <motion.div 
        className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Total Sessions"
            value={statsLoading ? '...' : stats.totalSessions.toString()}
            icon={Calendar}
            color="bg-blue-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="This Week"
            value={statsLoading ? '...' : stats.weeklyResets.toString()}
            icon={TrendingUp}
            color="bg-green-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Current Streak"
            value={statsLoading ? '...' : stats.currentStreak.toString()}
            icon={Award}
            color="bg-purple-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Total Minutes"
            value={statsLoading ? '...' : Math.round(stats.totalMinutes || 0).toString()}
            icon={Clock}
            color="bg-orange-500"
          />
        </motion.div>
      </motion.div>

      {/* Reconnect Score */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
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
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <StreaksHabitsBar refreshTrigger={refreshTrigger} />
      </motion.div>

      {/* Recent Sessions */}
      {/* {recentSessions.length > 0 && (
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Sessions
          </h3>
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {recentSessions.map((session) => {
              const protocol = audioProtocols.find(p => p.id === session.protocol_id);
              return (
                <motion.div 
                  key={session.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {protocol?.title || 'Unknown Protocol'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {session.completed ? 'Completed' : 'In Progress'}
                      </div>
                      {session.completed && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Calm: {session.post_calm}/10 • Clarity: {session.post_clarity}/10 • Energy: {session.post_energy}/10
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )} */}

      {/* Recommended Protocols */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {showAllProtocols
              ? 'All Protocols'
              : (allSessions.length === 0 ? 'Start Your Journey' : 'Recommended for You')}
          </h3>
          {allSessions.length > 0 && (
            <button
              onClick={() => setShowAllProtocols(prev => !prev)}
              className="text-sm px-3 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            >
              {showAllProtocols ? 'Show recommendations' : 'See all sessions'}
            </button>
          )}
        </div>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {(showAllProtocols ? audioProtocols : recommendedProtocols).map((protocol) => (
            <motion.div key={protocol.id} variants={itemVariants}>
              <ProtocolCard
                protocol={protocol}
                onPlay={() => setSelectedProtocolId(protocol.id)}
                isRecommended={!showAllProtocols && recommendedProtocols.includes(protocol)}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      
    </motion.div>
  );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors md:pb-0 relative overflow-x-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 md:block hidden fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => setActiveTab('today')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reconnect
              </h1>
            </button>
            
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('today')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'today'
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-current={activeTab === 'today' ? 'page' : undefined}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'library'
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-current={activeTab === 'library' ? 'page' : undefined}
              >
                Library
              </button>
              {/* <button
                onClick={() => setActiveTab('session')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'session'
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-current={activeTab === 'session' ? 'page' : undefined}
              >
                Play
              </button> */}
              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'data'
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-current={activeTab === 'data' ? 'page' : undefined}
              >
                My Data
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-current={activeTab === 'profile' ? 'page' : undefined}
              >
                Profile
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              
              <button
                onClick={signOut}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveTab('today')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activeTab === 'today' ? 'Today' :
                   activeTab === 'library' ? 'Library' :
                   activeTab === 'session' ? 'Session' :
                   activeTab === 'data' ? 'My Data' :
                   activeTab === 'more' ? 'More' : 'Reconnect'}
                </h1>
              </div>
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pb-8 md:pt-16 pb-24 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation - Only visible on mobile */}
      <div className="md:hidden">
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onStartSession={handleStartSession}
        />
      </div>

      {/* Session Modal */}
      <AnimatePresence>
        {selectedProtocolId && (
          <SessionModal
            protocol={audioProtocols.find(p => p.id === selectedProtocolId)!}
            onClose={() => setSelectedProtocolId(null)}
            onComplete={handleSessionComplete}
            preSessionData={sessionData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}