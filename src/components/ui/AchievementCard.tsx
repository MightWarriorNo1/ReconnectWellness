import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Sun, 
  Shield, 
  Users, 
  Star, 
  CheckCircle, 
  Clock,
  Target
} from 'lucide-react';
import { Achievement, UserAchievement } from '../../types';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  className?: string;
}

const iconMap = {
  Calendar,
  Sun,
  Shield,
  Users,
  Star,
  CheckCircle,
  Clock,
  Target
};

export function AchievementCard({ achievement, userAchievement, className = '' }: AchievementCardProps) {
  const Icon = iconMap[achievement.icon as keyof typeof iconMap] || Target;
  const progress = userAchievement?.progress || 0;
  const isCompleted = userAchievement?.completed || false;
  const progressPercentage = Math.min((progress / achievement.requirements.count) * 100, 100);

  return (
    <motion.div
      className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border-2 transition-all duration-300 h-full flex flex-col ${
        isCompleted 
          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20' 
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      } ${className}`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with icon and completion status */}
      <div className="flex items-start justify-between mb-4 min-h-[60px]">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${achievement.color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {isCompleted && (
          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <Star className="w-4 h-4 fill-current" />
          </div>
        )}
      </div>

      {/* Content area with flex-grow to fill available space */}
      <div className="flex-grow flex flex-col space-y-4">
        {/* Title and description with fixed height */}
        <div className="min-h-[100px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
            {achievement.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 flex-grow">
            {achievement.description}
          </p>
        </div>

        {/* Progress section with consistent spacing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
              🎖 {achievement.badge}
            </span>
            <span className="text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
              {progress}/{achievement.requirements.count}
            </span>
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div 
              className={`h-2 rounded-full bg-gradient-to-r ${achievement.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Reward section */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            ✅ <span className="font-medium">Reward:</span> {achievement.reward}
          </p>
        </div>
      </div>

      {/* Team challenge indicator at bottom */}
      {achievement.type === 'team' && (
        <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">Team Challenge</span>
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
            📊 HR will receive progress reports
          </p>
        </div>
      )}
    </motion.div>
  );
}