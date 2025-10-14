import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Target, Heart } from 'lucide-react';

interface PreSessionQuizProps {
  onClose: () => void;
  onStartSession: (moodData: MoodData, selectedNeed: string) => void;
}

interface MoodData {
  calm: number;
  clarity: number;
  energy: number;
}

export function PreSessionQuiz({ onClose, onStartSession }: PreSessionQuizProps) {
  const [moodData, setMoodData] = useState<MoodData>({
    calm: 50,
    clarity: 50,
    energy: 50
  });
  const [selectedNeed, setSelectedNeed] = useState<string>('');

  const handleMoodChange = (mood: keyof MoodData, value: number) => {
    setMoodData(prev => ({ ...prev, [mood]: value }));
  };

  const handleNeedSelect = (need: string) => {
    setSelectedNeed(need);
  };

  const handleStartSession = () => {
    if (selectedNeed) {
      // Convert 0-100 scale to 1-10 scale for database constraints
      const scaledMoodData = {
        calm: Math.round((moodData.calm / 100) * 9) + 1,
        clarity: Math.round((moodData.clarity / 100) * 9) + 1,
        energy: Math.round((moodData.energy / 100) * 9) + 1
      };
      onStartSession(scaledMoodData, selectedNeed);
    }
  };

  const needs = [
    { id: 'recharge', label: 'Recharge', icon: Zap, color: 'bg-yellow-500 hover:bg-yellow-600' },
    { id: 'focus', label: 'Focus', icon: Target, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'release', label: 'Release Stress', icon: Heart, color: 'bg-pink-500 hover:bg-pink-600' }
  ];

  const moodItems = [
    { 
      key: 'calm' as keyof MoodData, 
      label: 'Calm', 
      leftLabel: 'Anxious', 
      rightLabel: 'Calm' 
    },
    { 
      key: 'clarity' as keyof MoodData, 
      label: 'Clarity', 
      leftLabel: 'Foggy', 
      rightLabel: 'Clear' 
    },
    { 
      key: 'energy' as keyof MoodData, 
      label: 'Energy', 
      leftLabel: 'Tired', 
      rightLabel: 'Energetic' 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-md mx-auto p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          How are you feeling?
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Mood Sliders */}
      <div className="space-y-8 mb-8">
        {moodItems.map((item) => (
          <div key={item.key} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {item.label}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>{item.leftLabel}</span>
              <span>{item.rightLabel}</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={moodData[item.key]}
                onChange={(e) => handleMoodChange(item.key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-center mt-3">
                <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {moodData[item.key]}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What do you need section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What do you need right now?
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {needs.map((need) => {
            const Icon = need.icon;
            const isSelected = selectedNeed === need.id;
            return (
              <motion.button
                key={need.id}
                onClick={() => handleNeedSelect(need.id)}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`p-2 rounded-lg ${need.color} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-medium ${
                  isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {need.label}
                </span>
                {isSelected && (
                  <motion.div
                    className="ml-auto w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Start Session Button */}
      <motion.button
        onClick={handleStartSession}
        disabled={!selectedNeed}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          selectedNeed
            ? 'bg-teal-500 hover:bg-teal-600 shadow-lg'
            : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
        }`}
        whileHover={selectedNeed ? { scale: 1.02 } : {}}
        whileTap={selectedNeed ? { scale: 0.98 } : {}}
      >
        Start Session
      </motion.button>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-webkit-slider-track {
          background: #14b8a6;
          height: 8px;
          border-radius: 4px;
        }
        
        .slider::-moz-range-track {
          background: #14b8a6;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
      `}</style>
    </motion.div>
  );
}