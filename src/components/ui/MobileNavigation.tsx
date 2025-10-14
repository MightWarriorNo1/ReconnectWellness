import { motion } from 'framer-motion';
import {
  Home,
  Library,
  Play,
  BarChart3,
  MoreHorizontal
} from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onStartSession: (moodData: MoodData, selectedNeed: string) => void;
}

interface MoodData {
  calm: number;
  clarity: number;
  energy: number;
}

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {

  const tabs = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'add', label: 'Play', icon: Play, isCenter: true },
    { id: 'data', label: 'My Data', icon: BarChart3 },
    { id: 'more', label: 'More', icon: MoreHorizontal }
  ];

  const handlePlayClick = () => {
    onTabChange('session');
  };



  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-[9999] shadow-lg" style={{ width: '100vw', maxWidth: '100vw' }}>
        <div className="w-full px-4 py-2 overflow-hidden">
          <div className="flex items-center justify-around py-2 w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              if (tab.isCenter) {
                return (
                  <motion.button
                    key={tab.id}
                    onClick={handlePlayClick}
                    className="flex flex-col items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="w-14 h-14 bg-teal-500 hover:bg-teal-600 rounded-full shadow-lg flex items-center justify-center mb-1">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                      Start reset
                    </span>
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center px-2 py-2 min-w-0 ${isActive
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-gray-500 dark:text-gray-400'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-teal-600 dark:text-teal-400' : ''}`} />
                  </motion.div>
                  <span className={`text-xs font-medium ${isActive ? 'text-teal-600 dark:text-teal-400' : ''
                    }`}>
                    {tab.label}
                  </span>
                  
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>


    </>
  );
}