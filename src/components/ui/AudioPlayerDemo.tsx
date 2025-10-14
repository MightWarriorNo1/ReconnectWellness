import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedAudioPlayer } from './EnhancedAudioPlayer';
import { Play, ArrowLeft } from 'lucide-react';

const demoSessions = [
  {
    id: 'morning-intention',
    title: 'Start the Day with Intention',
    description: 'Connect with an intention to carry you throughout the day.',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo audio URL
    category: 'morning'
  },
  {
    id: 'inner-strength',
    title: 'Inner Strength',
    description: 'Cultivate your inner strength to stand in the face of challenge and uncertainty.',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo audio URL
    category: 'meditation'
  },
  {
    id: 'calm-center',
    title: 'Calm Center',
    description: 'Find your center of calm and peace within.',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo audio URL
    category: 'calm'
  }
];

interface AudioPlayerDemoProps {
  onBack?: () => void;
}

export function AudioPlayerDemo({ onBack }: AudioPlayerDemoProps) {
  const [selectedSession, setSelectedSession] = useState<typeof demoSessions[0] | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const handleSessionSelect = (session: typeof demoSessions[0]) => {
    setSelectedSession(session);
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setSelectedSession(null);
  };

  const handleAddSoundscape = () => {
    alert('Soundscape feature would be implemented here!');
  };

  if (showPlayer && selectedSession) {
    return (
      <EnhancedAudioPlayer
        title={selectedSession.title}
        description={selectedSession.description}
        audioUrl={selectedSession.audioUrl}
        onClose={handleClosePlayer}
        onAddSoundscape={handleAddSoundscape}
        showAddSoundscape={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to App</span>
            </button>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
            Enhanced Audio Player
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Experience the new meditation player design inspired by modern wellness apps. 
            Click on any session below to try it out.
          </p>
        </motion.div>

        {/* Session Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoSessions.map((session, index) => (
            <motion.div
              key={session.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSessionSelect(session)}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    session.category === 'morning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                    session.category === 'meditation' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  }`}>
                    {session.category.charAt(0).toUpperCase() + session.category.slice(1)}
                  </span>
                  <Play className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {session.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {session.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Click to start session
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-slate-400 rotate-180" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div 
          className="mt-16 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">
            New Player Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Modern Controls</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Intuitive play/pause, skip forward/backward with smooth animations
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Beautiful Design</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Gradient backgrounds, smooth transitions, and mobile-first responsive layout
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-1 bg-white rounded-full"></div>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Interactive Progress</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Clickable progress bar with real-time updates and smooth animations
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
