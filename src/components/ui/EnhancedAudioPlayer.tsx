import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Plus
} from 'lucide-react';

interface EnhancedAudioPlayerProps {
  title: string;
  description: string;
  audioUrl: string;
  onClose?: () => void;
  onAddSoundscape?: () => void;
  showAddSoundscape?: boolean;
  className?: string;
  onSessionComplete?: () => void;
  showSessionComplete?: boolean;
}

export function EnhancedAudioPlayer({
  title,
  description,
  audioUrl,
  onAddSoundscape,
  showAddSoundscape = true,
  className = '',
  onSessionComplete,
  showSessionComplete = false
}: EnhancedAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        setDuration(audio.duration);
        setIsLoading(false);
      };

      const handleCanPlay = () => {
        console.log('Audio can play, duration:', audio.duration);
        if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleError = (e: any) => {
        console.error('Audio error:', e);
        setIsLoading(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        // Calculate final session time when audio ends
        if (sessionStartTime) {
          const elapsed = Date.now() - sessionStartTime;
          setTotalSessionTime(prev => prev + elapsed);
          setSessionStartTime(null);
        }
        // Auto-complete session when audio ends
        if (onSessionComplete && showSessionComplete) {
          setTimeout(() => {
            handleSessionComplete();
          }, 1000); // Small delay to show completion state
        }
      };

      const handleLoadStart = () => {
        console.log('Audio load started');
        setIsLoading(true);
      };

      // Add multiple event listeners to ensure we catch duration
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadstart', handleLoadStart);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadstart', handleLoadStart);
      };
    }
  }, [audioUrl]);

  // Track session time in real-time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && sessionStartTime && !isSessionCompleted) {
      interval = setInterval(() => {
        // Force re-render to update session time display
        setTotalSessionTime(prev => prev);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, sessionStartTime, isSessionCompleted]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        // Calculate session time when pausing
        if (sessionStartTime) {
          const elapsed = Date.now() - sessionStartTime;
          setTotalSessionTime(prev => prev + elapsed);
          setSessionStartTime(null);
        }
      } else {
        audioRef.current.play();
        // Start tracking session time when playing
        setSessionStartTime(Date.now());
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSessionDuration = () => {
    // If session is completed, return the final accumulated time
    if (isSessionCompleted) {
      return Math.floor(totalSessionTime / 1000);
    }
    
    // Otherwise, return current time including active session time
    let totalDuration = totalSessionTime;
    if (sessionStartTime && isPlaying) {
      totalDuration += Date.now() - sessionStartTime;
    }
    return Math.floor(totalDuration / 1000); // Convert to seconds
  };

  const handleSessionComplete = () => {
    // Stop time tracking and capture final elapsed time
    if (sessionStartTime) {
      const finalElapsed = Date.now() - sessionStartTime;
      setTotalSessionTime(prev => prev + finalElapsed);
      setSessionStartTime(null);
    }
    // Mark session as completed to prevent further time tracking
    setIsSessionCompleted(true);
    // Call the original onSessionComplete callback
    if (onSessionComplete) {
      onSessionComplete();
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-indigo-600 to-purple-700 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600" />
      


      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-32">
        {/* Title and Description */}
        <div className="text-center mb-12 max-w-md">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h1>
          <motion.p 
            className="text-lg text-white/90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {description}
          </motion.p>
        </div>

         {/* Session Complete Button */}
         {showSessionComplete && onSessionComplete && (
           <motion.button
             onClick={handleSessionComplete}
             className="bg-white/25 backdrop-blur-sm hover:bg-white/35 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 mb-16 shadow-lg border border-white/20"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.4 }}
           >
             Complete Session ({formatTime(getCurrentSessionDuration())})
           </motion.button>
         )}

        {/* Audio Player Controls */}
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-8 mb-6">
            <button
              onClick={skipBackward}
              className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center hover:bg-white/35 transition-all duration-200 shadow-lg border border-white/20"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-all duration-200 shadow-xl border-2 border-white/30"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 text-gray-800" />
              ) : (
                <Play className="w-7 h-7 text-gray-800 ml-1" />
              )}
            </button>

            <button
              onClick={skipForward}
              className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center hover:bg-white/35 transition-all duration-200 shadow-lg border border-white/20"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-white/95 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : 'Loading...'}</span>
            </div>
            
            <div
              ref={progressBarRef}
              onClick={handleProgressBarClick}
              className="w-full h-2 bg-white/30 rounded-full cursor-pointer relative shadow-inner"
            >
              <div
                className="h-2 bg-white rounded-full transition-all duration-300 relative shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-white/50" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        crossOrigin="anonymous"
      />
    </div>
  );
}
