import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, SkipBack, SkipForward, Square, HelpCircle, CheckCircle } from 'lucide-react';
import { AudioProtocol } from '../../types';
import { useAudioDuration } from '../../hooks/useAudioDuration';
import { EnhancedAudioPlayer } from '../ui/EnhancedAudioPlayer';

interface SessionModalProps {
  protocol: AudioProtocol;
  onClose: () => void;
  onComplete: (sessionData: any) => void;
  preSessionData?: {
    moodData: {
      calm: number;
      clarity: number;
      energy: number;
    };
    selectedNeed: string;
  };
}

type SessionPhase = 'pre-session' | 'session' | 'post-session';

export function SessionModal({ protocol, onClose, onComplete, preSessionData }: SessionModalProps) {
  const [phase, setPhase] = useState<SessionPhase>(preSessionData ? 'session' : 'pre-session');
  const [preRatings, setPreRatings] = useState({ 
    calm: preSessionData?.moodData.calm || 5, 
    clarity: preSessionData?.moodData.clarity || 5, 
    energy: preSessionData?.moodData.energy || 5 
  });
  const [postRatings, setPostRatings] = useState({ calm: 5, clarity: 5, energy: 5 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [sessionEndedEarly, setSessionEndedEarly] = useState(false);
  const [showEnhancedPlayer, setShowEnhancedPlayer] = useState(preSessionData ? true : false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { duration: audioDuration, error: audioError } = useAudioDuration(protocol.audioUrl);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (audioRef.current && !audioError) {
      if (isPlaying) {
        audioRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        audioRef.current.play();
        intervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            if (audioRef.current.ended) {
              setIsPlaying(false);
                // Auto-complete session when audio ends
                setTimeout(() => {
                  setPhase('post-session');
                }, 500);
              setPhase('post-session');
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }
          }
        }, 1000);
      }
      setIsPlaying(!isPlaying);
    } else {
      // Fallback for when audio fails to load
      if (isPlaying) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        intervalRef.current = setInterval(() => {
          setCurrentTime(prev => {
            const newTime = prev + 1;
            if (audioDuration && newTime >= audioDuration) {
              setIsPlaying(false);
              // Auto-complete session when audio ends (fallback)
              setTimeout(() => {
                setPhase('post-session');
              }, 500);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              return audioDuration;
            }
            return newTime;
          });
        }, 1000);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (audioRef.current && !audioError) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, audioDuration || 0);
    } else {
      setCurrentTime(prev => Math.min(prev + 15, audioDuration || 0));
    }
  };

  const skipBackward = () => {
    if (audioRef.current && !audioError) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    } else {
      setCurrentTime(prev => Math.max(prev - 15, 0));
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleEndSession = () => {
    setShowEndSessionConfirm(true);
  };

  const confirmEndSession = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setSessionEndedEarly(true);
    setShowEndSessionConfirm(false);
    setPhase('post-session');
  };

  const cancelEndSession = () => {
    setShowEndSessionConfirm(false);
  };

  const getContextText = (key: string) => {
    const contexts = {
      calm: "How tense or grounded do you feel?",
      clarity: "How foggy or sharp is your mind?",
      energy: "How drained or recharged do you feel?"
    };
    return contexts[key as keyof typeof contexts] || "";
  };
  const handleStartSession = () => {
    setPhase('session');
    setShowEnhancedPlayer(true);
  };

  const handleCompleteSession = () => {
    const sessionData = {
      protocolId: protocol.id,
      preCalmValue: preRatings.calm,
      preClarityValue: preRatings.clarity,
      preEnergyValue: preRatings.energy,
      postCalmValue: postRatings.calm,
      postClarityValue: postRatings.clarity,
      postEnergyValue: postRatings.energy,
      duration: sessionEndedEarly ? currentTime : (audioDuration || 0),
      completed: currentTime >= (audioDuration || 0) * 0.8 // Consider completed if 80% done
    };

    // Show success toast
    setShowSuccessToast(true);

    // Complete session and close modal after a short delay
    setTimeout(() => {
      onComplete(sessionData);
      onClose();
    }, 1500);
  };

  const renderPreSession = () => (
    <div className="space-y-1">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Ready to start your session?
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 px-1 mb-1">
          First, let's see how you're feeling right now
        </p>
      </div>

      <div className="space-y-1">
        {Object.entries(preRatings).map(([key, value]) => (
          <div key={key} className="space-y-0.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {key}
              </h3>
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(key)}
                  onMouseLeave={() => setShowTooltip(null)}
                  onClick={() => setShowTooltip(showTooltip === key ? null : key)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                >
                  <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                {showTooltip === key && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute bottom-full right-0 mb-1 w-28 sm:w-32 p-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-10"
                  >
                    <div className="text-center">
                      {getContextText(key)}
                    </div>
                    <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              <span>{key === 'calm' ? 'Anxious' : key === 'clarity' ? 'Foggy' : 'Tired'}</span>
              <span>{key === 'calm' ? 'Calm' : key === 'clarity' ? 'Clear' : 'Energetic'}</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={value}
                onChange={(e) => setPreRatings(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-center mt-0.5">
                <div className="bg-teal-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {value}/10
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleStartSession}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium text-sm transition-colors mt-2"
      >
        Start Session
      </button>
      
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
    </div>
  );

  const renderSession = () => {
    if (showEnhancedPlayer) {
      return (
        <EnhancedAudioPlayer
          title={protocol.title}
          description={protocol.description}
          audioUrl={protocol.audioUrl}
          onClose={() => setShowEnhancedPlayer(false)}
          onAddSoundscape={() => {
            // TODO: Implement soundscape feature
            console.log('Add soundscape clicked');
          }}
          showAddSoundscape={true}
          onSessionComplete={() => {
            setShowEnhancedPlayer(false);
            // Auto-complete session
            setTimeout(() => {
              setPhase('post-session');
            }, 500);
          }}
          showSessionComplete={true}
        />
      );
    }

    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="text-center">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {protocol.title}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 px-1">
            {protocol.description}
          </p>
        </div>

        {/* Audio Element */}
        {!audioError && (
          <audio
            ref={audioRef}
            src={protocol.audioUrl}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                audioRef.current.volume = volume;
              }
            }}
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
          />
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration || 0)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${audioDuration ? (currentTime / audioDuration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Enhanced Audio Controls */}
        <div className="flex justify-center items-center space-x-3">
          <button
            onClick={skipBackward}
            className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-full"
            title="Skip back 15s"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlayPause}
            className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button
            onClick={skipForward}
            className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-full"
            title="Skip forward 15s"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>



        {/* End Session Button */}
        <div className="flex justify-center">
          <button
            onClick={handleEndSession}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
            title="End session early"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* End Session Confirmation Modal */}
        {showEndSessionConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                End Session Early?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to end this session? You'll still be able to complete the post-session assessment.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelEndSession}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
                >
                  Continue Session
                </button>
                <button
                  onClick={confirmEndSession}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderPostSession = () => (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="text-center">
          {/* Session Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
              🎉 Session Complete!
            </h4>
            <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4 text-center text-xs sm:text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Duration</div>
                <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                  {formatTime(sessionEndedEarly ? currentTime : (audioDuration || 0))}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Protocol</div>
                <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                  {protocol.title}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400 text-xs">Category</div>
                <div className="font-medium text-gray-900 dark:text-white capitalize text-xs sm:text-sm">
                  {protocol.category}
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 text-center px-1">
            Great job! Please rate how you're feeling now:
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {Object.entries(postRatings).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="flex items-center justify-between text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="capitalize flex-1">{key} (1-10)</span>
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip(`post-${key}`)}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={() => setShowTooltip(showTooltip === `post-${key}` ? null : `post-${key}`)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  >
                    <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  {showTooltip === `post-${key}` && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute bottom-full right-0 mb-2 w-32 sm:w-48 p-2 sm:p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-10"
                    >
                      <div className="text-center">
                        {getContextText(key)}
                      </div>
                      <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </motion.div>
                  )}
                </div>
              </label>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-xs sm:text-sm text-gray-500 w-4 sm:w-6 text-center">1</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={value}
                  onChange={(e) => setPostRatings(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="text-xs sm:text-sm text-gray-500 w-4 sm:w-6 text-center">10</span>
                <span className="w-6 sm:w-8 text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">{value}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCompleteSession}
          disabled={showSuccessToast}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white py-3 sm:py-3.5 rounded-lg font-medium text-sm sm:text-base transition-colors"
        >
          {showSuccessToast ? 'Session Completed!' : 'Complete Session'}
        </button>
      </div>
    );

    return (
      <>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1 sm:p-2 md:p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`bg-white dark:bg-gray-800 rounded-xl w-full max-h-[95vh] overflow-y-auto ${
              phase === 'pre-session' 
                ? 'max-w-[85vw] sm:max-w-xs p-2 sm:p-3' 
                : 'max-w-[95vw] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl'
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-1 sm:mb-2">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white pr-2">
                {phase === 'pre-session' && 'Pre-Session'}
                {phase === 'session' && 'Session Active'}
                {phase === 'post-session' && 'Session Complete'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {phase === 'pre-session' && renderPreSession()}
            {phase === 'session' && renderSession()}
            {phase === 'post-session' && renderPostSession()}
          </motion.div>
        </motion.div>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              className="fixed top-2 sm:top-4 right-2 sm:right-4 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 z-60"
              initial={{ opacity: 0, y: -50, x: 50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -50, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Session completed successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }