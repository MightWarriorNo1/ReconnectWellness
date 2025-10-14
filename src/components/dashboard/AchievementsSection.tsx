import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { AchievementCard } from '../ui/AchievementCard';
import { achievements } from '../../data/achievements';
import { useUserAchievements } from '../../hooks/useUserAchievements';

interface AchievementsSectionProps {
  onRefresh?: () => void;
  refreshTrigger?: number;
}

export function AchievementsSection({ onRefresh, refreshTrigger }: AchievementsSectionProps) {
  const { userAchievements, loading } = useUserAchievements(refreshTrigger);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const completedCount = userAchievements.filter(ua => ua.completed).length;
  const totalCount = achievements.length;

  // Get completed achievements for badges section
  const completedAchievements = userAchievements
    .filter(ua => ua.completed)
    .map(ua => achievements.find(a => a.id === ua.achievementId))
    .filter(Boolean);

  return (
    <div className="space-y-8">

      {/* Achievements & Challenges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Achievements & Challenges
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-yellow-600 fill-current" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              {completedCount}/{totalCount} Completed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {achievements.map((achievement, index) => {
            const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);

            
            return (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                userAchievement={userAchievement}
                delay={index * 0.1}
              />
            );
          })}
        </div>
        {completedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white text-center mt-8"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="w-6 h-6" />
              <span className="text-lg font-semibold">Congratulations!</span>
            </div>
            <p className="text-emerald-100">
              You've completed {completedCount} achievement{completedCount !== 1 ? 's' : ''}! 
              Keep up the great work on your wellness journey.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}