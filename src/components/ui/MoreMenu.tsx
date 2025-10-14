import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  HelpCircle, 
  Shield, 
  Bell,
  ChevronRight,
  Award,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface MoreMenuProps {
  onShowProfile: () => void;
}

export function MoreMenu({ onShowProfile }: MoreMenuProps) {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          action: onShowProfile,
          description: 'Manage your account settings'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          action: () => {},
          description: 'Manage notification preferences'
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'theme',
          label: isDark ? 'Light Mode' : 'Dark Mode',
          icon: isDark ? Sun : Moon,
          action: toggleTheme,
          description: 'Switch app appearance'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          action: () => {},
          description: 'App preferences and configuration'
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Help & Support',
          icon: HelpCircle,
          action: () => {},
          description: 'Get help and contact support'
        },
        {
          id: 'privacy',
          label: 'Privacy Policy',
          icon: Shield,
          action: () => {},
          description: 'View our privacy policy'
        }
      ]
    }
  ];

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </motion.div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {user?.user_metadata?.full_name || 'Welcome'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {user?.email}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Award className="w-6 h-6 text-teal-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">0</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Achievements</div>
        </motion.div>
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <BarChart3 className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">0</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Sessions</div>
        </motion.div>
      </motion.div>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 + sectionIndex * 0.1 }}
        >
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
            {section.title}
          </h3>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    itemIndex < section.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                  }`}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      ))}

      {/* Sign Out */}
      <motion.button
        onClick={signOut}
        className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.99 }}
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </motion.button>

      {/* App Version */}
      <motion.div 
        className="text-center text-xs text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        Reconnect v1.0.0
      </motion.div>
    </motion.div>
  );
}