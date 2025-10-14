import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Award, Heart, Calendar, Info, ArrowUp, Target, BarChart3, X, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ReconnectScoreProps {
  calm: number;
  clarity: number;
  energy: number;
  reconnectScore: number;
  sessionQualities?: Array<{
    sessionQuality: number;
    date: string;
    id: string;
    preCalm: number;
    postCalm: number;
    preClarity: number;
    postClarity: number;
    preEnergy: number;
    postEnergy: number;
  }>;
  consistencyBonus?: number;
  weeklyResetsCount?: number;
  inactivityPenalty?: number;
  daysSinceLastSession?: number | null;
  className?: string;
  showRecentSessions?: boolean;
}

export function ReconnectScore({ 
  calm, 
  clarity, 
  energy, 
  reconnectScore, 
  sessionQualities = [],
  consistencyBonus = 0,
  weeklyResetsCount = 0,
  inactivityPenalty = 0,
  daysSinceLastSession = null,
  className = '',
  showRecentSessions = false
}: ReconnectScoreProps) {
  const hasData = calm > 0 || clarity > 0 || energy > 0;
  const [selectedSession, setSelectedSession] = React.useState<any>(null);
  
  // Get the most recent session's post values, fallback to averages
  const getLastSessionValues = () => {
    if (sessionQualities.length > 0) {
      const lastSession = sessionQualities[0]; // Most recent session
      return {
        calm: lastSession.postCalm * 10, // Convert from 1-10 scale to 0-100
        clarity: lastSession.postClarity * 10,
        energy: lastSession.postEnergy * 10
      };
    }
    // Fallback to averages if no session data
    return { calm: calm * 10, clarity: clarity * 10, energy: energy * 10 };
  };
  
  const displayValues = getLastSessionValues();
  const displayScore = reconnectScore;
  
  // Get score level and color
  const getScoreLevel = (score: number) => {
    if (score >= 85) return { 
      level: 'Peak Performance', 
      color: 'from-emerald-500 to-emerald-600', 
      icon: Award,
      bgColor: 'from-emerald-500/10 to-emerald-600/10',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      message: '🏆 Outstanding wellness journey!'
    };
    if (score >= 70) return { 
      level: 'Strong Progress', 
      color: 'from-blue-500 to-blue-600', 
      icon: TrendingUp,
      bgColor: 'from-blue-500/10 to-blue-600/10',
      textColor: 'text-blue-600 dark:text-blue-400',
      message: '⭐ Excellent consistency and growth!'
    };
    if (score >= 55) return { 
      level: 'Good Foundation', 
      color: 'from-indigo-500 to-indigo-600', 
      icon: Sparkles,
      bgColor: 'from-indigo-500/10 to-indigo-600/10',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      message: '✨ Building strong wellness habits!'
    };
    return { 
      level: 'Building Momentum', 
      color: 'from-amber-500 to-amber-600', 
      icon: Target,
      bgColor: 'from-amber-500/10 to-amber-600/10',
      textColor: 'text-amber-600 dark:text-amber-400',
      message: '📈 Every session counts - keep going!'
    };
  };
  
  const scoreInfo = getScoreLevel(displayScore);
  const ScoreIcon = scoreInfo.icon;
  
  // Calculate progress dots (5 dots, each representing 20 points)
  const progressDots = Array.from({ length: 5 }, (_, i) => {
    const threshold = (i + 1) * 20;
    return displayScore >= threshold;
  });

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Main Score Display - Inspired by the circular designs */}
      <div className="relative">
        {/* Background glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${scoreInfo.bgColor} rounded-3xl blur-xl`}></div>
        
        <motion.div
          className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-slate-700/30 shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${scoreInfo.color}`}>
                <ScoreIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reconnect Score</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Overall wellness performance</p>
              </div>
            </div>
            
            {/* Info tooltip */}
            <div className="group relative">
              <HelpCircle className="w-5 h-5 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-80 p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-2xl border border-gray-200 dark:border-slate-700">
                <p className="font-medium mb-2">How your score is calculated:</p>
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                  Your Reconnect Score combines your post-session wellness levels, improvement over time, and consistency. The circle shows your overall progress out of 100.
                </p>
                <div className="absolute top-full right-4 border-4 border-transparent border-t-white dark:border-t-slate-800"></div>
              </div>
            </div>
          </div>

          {/* Single main color circle with central score */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative group">
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${scoreInfo.bgColor} blur-xl scale-125`}></div>
              <motion.div
                className="relative w-56 h-56 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                {(() => {
                  const radius = 100;
                  const circumference = 2 * Math.PI * radius;
                  const trackColor = 'rgba(148, 163, 184, 0.25)';
                  const mainColor = scoreInfo.textColor.includes('emerald') ? '#10b981'
                    : scoreInfo.textColor.includes('blue') ? '#3b82f6'
                    : scoreInfo.textColor.includes('indigo') ? '#6366f1'
                    : '#f59e0b';
                  const progress = Math.max(0, Math.min(100, displayScore));
                  const offset = circumference * (1 - progress / 100);
                  return (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 224 224">
                      <circle
                        cx="112"
                        cy="112"
                        r={radius}
                        fill="none"
                        stroke={trackColor}
                        strokeWidth="14"
                      />
                      <motion.circle
                        cx="112"
                        cy="112"
                        r={radius}
                        fill="none"
                        stroke={mainColor}
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.6, ease: 'easeOut', delay: 0.4 }}
                      />
                    </svg>
                  );
                })()}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full border-4 border-gray-200 dark:border-slate-700 flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <motion.div
                        className="text-3xl font-bold text-gray-900 dark:text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                      >
                        {displayScore}
                      </motion.div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 -mt-1">
                        /100
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Tooltip styled like the question mark tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-2xl border border-gray-200 dark:border-slate-700 text-center">
                Your system is {Math.round(displayScore)}% recharged today!!!
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-slate-800"></div>
              </div>
            </div>
          </div>

          {/* Ring Labels */}
          <div className="flex justify-center items-center space-x-8 mb-6">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Calm {hasData ? `${Math.round(displayValues.calm)}` : '--'}
              </span>
            </motion.div>
            
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Clarity {hasData ? `${Math.round(displayValues.clarity)}` : '--'}
              </span>
            </motion.div>
            
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Energy {hasData ? `${Math.round(displayValues.energy)}` : '--'}
              </span>
            </motion.div>
          </div>

          {/* Status and Progress Indicators */}
          <div className="space-y-4">
            {/* Status badge */}
            <motion.div
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${scoreInfo.bgColor} border border-gray-300/30 dark:border-slate-700/30 mx-auto`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <div className={`w-2 h-2 rounded-full ${scoreInfo.textColor.includes('emerald') ? 'bg-emerald-500' : 
                scoreInfo.textColor.includes('blue') ? 'bg-blue-500' :
                scoreInfo.textColor.includes('indigo') ? 'bg-indigo-500' : 'bg-amber-500'} animate-pulse`}></div>
              <span className={`text-sm font-semibold ${scoreInfo.textColor}`}>
                {scoreInfo.level}
              </span>
              <TrendingUp className={`w-4 h-4 ${scoreInfo.textColor}`} />
            </motion.div>
            

            {/* Motivational message */}
            <motion.p
              className="text-center text-gray-700 dark:text-slate-300 text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.0 }}
            >
              {scoreInfo.message}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Recent Session Scores */}
      {sessionQualities.length > 0 && (
        <motion.div
          className={`bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-lg ${
            showRecentSessions ? '' : 'hidden md:block'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.2 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Session Scores</h3>
            <span className="text-sm text-gray-600 dark:text-slate-400">
              (Last {sessionQualities.length} sessions)
            </span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {sessionQualities.map((session, index) => (
              <motion.div
                key={session.id}
                className="text-center cursor-pointer relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 2.3 + index * 0.1 }}
                onClick={() => setSelectedSession(session)}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.2)"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={session.sessionQuality >= 80 ? "#10b981" : 
                               session.sessionQuality >= 60 ? "#3b82f6" : 
                               session.sessionQuality >= 40 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - session.sessionQuality / 100)}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - session.sessionQuality / 100) }}
                        transition={{ duration: 1, delay: 2.4 + index * 0.1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {session.sessionQuality}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Tooltip for each recent session point */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2 whitespace-nowrap px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-xl border border-gray-200 dark:border-slate-700">
                  Your system is {Math.round(session.sessionQuality)}% recharged today!!!
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-slate-800"></div>
                </div>
                <div className="text-xs text-slate-400 hidden sm:block">
                  {format(new Date(session.date), 'MMM d')}
                </div>
              </motion.div>
            ))}
            
            {/* Fill empty slots if less than 5 sessions */}
            {Array.from({ length: 5 - sessionQualities.length }).map((_, index) => (
              <div key={`empty-${index}`} className="text-center hidden sm:block">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 rounded-full border-2 border-dashed border-gray-400 dark:border-slate-600 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-slate-500 text-xs">--</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-500">No data</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

    
      {/* Consistency Bonus Display */}
      {consistencyBonus > 0 && (
        <motion.div
          className="hidden md:flex items-center justify-center space-x-2 text-sm bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.9 }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-600 dark:text-green-400 font-medium">
            +{consistencyBonus} consistency bonus ({weeklyResetsCount} resets this week)
          </span>
        </motion.div>
      )}

      {/* Inactivity Penalty Display */}
      {inactivityPenalty > 0 && daysSinceLastSession !== null && (
        <motion.div
          className="hidden md:flex items-center justify-center space-x-2 text-sm bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 3.0 }}
        >
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <span className="text-orange-600 dark:text-orange-400 font-medium">
            -{inactivityPenalty} inactivity penalty ({daysSinceLastSession} days since last session)
          </span>
        </motion.div>
      )}

      {/* Encouragement Message for Inactive Users */}
      {daysSinceLastSession !== null && daysSinceLastSession >= 3 && (
        <motion.div
          className="hidden md:flex items-center justify-center space-x-2 text-sm bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 3.1 }}
        >
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            💪 Ready to get back on track? Complete a session to boost your score!
          </span>
        </motion.div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <motion.div
          className="fixed inset-0 bg-black/50 dark:bg-black/50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSession(null)}
        >
          <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session Details</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                {format(new Date(selectedSession.date), 'MMMM d, yyyy • h:mm a')}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {selectedSession.sessionQuality}
              </div>
              <div className="text-gray-600 dark:text-slate-400">Session Quality Score</div>
            </div>

            {/* Individual Metrics with consistent colors */}
            <div className="grid grid-cols-3 gap-4">
              {/* Calm - Blue */}
              <div className="text-center">
                <div className="relative mb-3">
                  <div className="w-16 h-16 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.2)"
                        strokeWidth="6"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 35}`}
                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - (selectedSession.postCalm * 10) / 100)}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - (selectedSession.postCalm * 10) / 100) }}
                        transition={{ duration: 1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {selectedSession.postCalm * 10}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-1">
                  Calm
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-500">
                  {selectedSession.preCalm * 10} → {selectedSession.postCalm * 10}
                </div>
              </div>

              {/* Clarity - Green */}
              <div className="text-center">
                <div className="relative mb-3">
                  <div className="w-16 h-16 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="rgba(34, 197, 94, 0.2)"
                        strokeWidth="6"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 35}`}
                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - (selectedSession.postClarity * 10) / 100)}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - (selectedSession.postClarity * 10) / 100) }}
                        transition={{ duration: 1, delay: 0.1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {selectedSession.postClarity * 10}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-green-400 uppercase tracking-wider font-semibold mb-1">
                  Clarity
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-500">
                  {selectedSession.preClarity * 10} → {selectedSession.postClarity * 10}
                </div>
              </div>

              {/* Energy - Orange */}
              <div className="text-center">
                <div className="relative mb-3">
                  <div className="w-16 h-16 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="rgba(251, 146, 60, 0.2)"
                        strokeWidth="6"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="#fb923c"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 35}`}
                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - (selectedSession.postEnergy * 10) / 100)}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - (selectedSession.postEnergy * 10) / 100) }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {selectedSession.postEnergy * 10}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-orange-400 uppercase tracking-wider font-semibold mb-1">
                  Energy
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-500">
                  {selectedSession.preEnergy * 10} → {selectedSession.postEnergy * 10}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}