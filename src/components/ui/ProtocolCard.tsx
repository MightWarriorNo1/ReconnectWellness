import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Sparkles, Star } from 'lucide-react';
import { AudioProtocol } from '../../types';
import { useAudioDuration } from '../../hooks/useAudioDuration';

interface ProtocolCardProps {
  protocol: AudioProtocol;
  onPlay: (protocol: AudioProtocol) => void;
  isRecommended?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (protocolId: string) => void;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function ProtocolCard({ 
  protocol, 
  onPlay, 
  isRecommended = false, 
  isFavorite = false,
  onToggleFavorite,
  className = '',
  variant = 'default'
}: ProtocolCardProps) {
  const { duration, loading } = useAudioDuration(protocol.audioUrl);
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}m` : `${mins}m`;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(protocol.id);
    }
  };

  return (
    <motion.div
      className={`group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm h-[220px] ${
        isRecommended ? 'before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:p-[1.5px] before:bg-gradient-to-br before:from-indigo-300/70 before:to-teal-300/70 before:content-[""] before:pointer-events-none dark:before:from-indigo-500/40 dark:before:to-teal-500/40' : ''
      } ${className}`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Favorite Button */}
      {onToggleFavorite && (
        <motion.button
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm rounded-full p-2 hover:bg-white dark:hover:bg-slate-600 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Star 
            className={`w-4 h-4 transition-all duration-200 ${
              isFavorite 
                ? 'fill-yellow-400 text-yellow-500' 
                : 'text-slate-400 hover:text-yellow-400'
            }`}
          />
        </motion.button>
      )}

      {/* Recommended Badge */}
      
      {/* Horizontal Layout */}
      <div className="flex h-full">
        {/* Left side - Gradient background with play button */}
        {variant === 'default' && (
          <div className={`w-28 flex-shrink-0 bg-gradient-to-br ${protocol.color} relative`}>
            <div className="absolute inset-0 bg-black/10" />
            <motion.button
              onClick={() => onPlay(protocol)}
              className="absolute inset-0 flex items-center justify-center focus:outline-none"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="rounded-full p-3 bg-white/20 backdrop-blur-md transition-all duration-200 group-hover:bg-white/30 ring-1 ring-white/30">
                <Play className="w-5 h-5 text-white fill-current" />
              </div>
            </motion.button>
          </div>
        )}
        
        {/* Right side - Content */}
        <div className="flex-1 p-3 flex flex-col justify-between h-full overflow-hidden">
          {/* Header Section */}
          <div className="flex-shrink-0 mb-2">
            {/* Duration and Badge Row (Mobile) */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  {loading ? '...' : duration ? formatDuration(duration) : `${protocol.duration}m`}
                </span>
              </div>
              {/* Recommended Badge - Mobile Position */}
              {isRecommended && (
                <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  <span>Recommended</span>
                </div>
              )}
            </div>
            
            {/* Title Row */}
            <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-tight mb-1">
              {protocol.title}
            </h3>
            
            {/* Tagline */}
            <p className="text-indigo-600 dark:text-indigo-400 text-xs font-medium italic line-clamp-1">
              "{protocol.tagline}"
            </p>
          </div>
          
          {/* Description - Flexible height */}
          <div className="flex-1 mb-3">
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-4 line-clamp-3">
              {protocol.description}
            </p>
          </div>
          
          {/* Bottom section */}
          <div className="flex-shrink-0 space-y-2">
            {/* Impact Indicators */}
            {protocol.impact && (
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-slate-600 dark:text-slate-400 truncate">Calm {protocol.impact.calm}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-slate-600 dark:text-slate-400 truncate">Clarity {protocol.impact.clarity}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <span className="text-slate-600 dark:text-slate-400 truncate">Energy {protocol.impact.energy}%</span>
                </div>
              </div>
            )}
            
            {/* Category and Play button */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium
                ${protocol.category === 'focus' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                  protocol.category === 'energy' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                  protocol.category === 'calm' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                  protocol.category === 'clarity' ? 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200' :
                  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                }`}
              >
                {protocol.category.charAt(0).toUpperCase() + protocol.category.slice(1)}
              </span>
              {variant === 'minimal' && (
                <motion.button
                  onClick={() => onPlay(protocol)}
                  className="ml-2 inline-flex items-center px-2 py-1 rounded-md bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="w-3 h-3 mr-1" /> Play
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}