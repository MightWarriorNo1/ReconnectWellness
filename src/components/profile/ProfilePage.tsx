import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Settings,
  Activity,
  Award,
  Clock,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserStats } from '../../hooks/useUserStats';
import { useSessions } from '../../hooks/useSessions';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface ProfilePageProps {
  onBack: () => void;
  sessions?: any[];
  onRefresh?: () => void;
}

export function ProfilePage({ onBack, sessions, onRefresh }: ProfilePageProps) {
  const { user, signOut } = useAuth();
  const { stats } = useUserStats();
  const { getUserSessions } = useSessions();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      // Use sessions passed from parent if available
      setRecentSessions(sessions.slice(0, 5));
    } else {
      // Fallback to loading from API
      loadRecentSessions();
    }
  }, [sessions]);

  const loadRecentSessions = async () => {
    try {
      const sessions = await getUserSessions(5);
      setRecentSessions(sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profile.fullName }
      });

      if (error) throw error;

      // Update local profile in database
      await supabase
        .from('profiles')
        .update({ full_name: profile.fullName })
        .eq('id', user.id);

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
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

  const getScoreColor = (score: number) => {
    const scaledScore = Math.round(score * 10);
    if (scaledScore >= 80) return 'text-green-600 dark:text-green-400';
    if (scaledScore >= 60) return 'text-blue-600 dark:text-blue-400';
    if (scaledScore >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600">
                    <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {profile.fullName || 'Not set'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{profile.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {user?.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Stats & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Activity className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Stats
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600 mb-1">
                    {stats.totalSessions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Sessions
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {stats.currentStreak}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Day Streak
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {stats.reconnectScore}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Reconnect Score
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {stats.completionRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Sessions
                </h2>
              </div>

              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
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
                        <div className="flex space-x-4 text-sm">
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(session.post_calm || 0)}`}>
                              {session.post_calm || 0}
                            </div>
                            <div className="text-xs text-gray-500">Calm</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(session.post_clarity || 0)}`}>
                              {session.post_clarity || 0}
                            </div>
                            <div className="text-xs text-gray-500">Clarity</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-medium ${getScoreColor(session.post_energy || 0)}`}>
                              {session.post_energy || 0}
                            </div>
                            <div className="text-xs text-gray-500">Energy</div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No sessions yet. Start your first session to see your progress here!
                  </p>
                </div>
              )}
            </motion.div>

            {/* Account Settings */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Account Settings
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Receive updates about your progress
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Weekly Reports
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Get weekly summaries of your wellness journey
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}