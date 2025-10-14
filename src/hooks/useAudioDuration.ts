import { useState, useEffect } from 'react';

export function useAudioDuration(audioUrl: string) {
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!audioUrl) {
      setLoading(false);
      return;
    }

    const audio = new Audio();
    audio.preload = 'metadata';
    
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.floor(audio.duration));
      }
      setLoading(false);
    };

    const handleError = () => {
      console.warn(`Failed to load audio metadata for: ${audioUrl}`);
      setDuration(null);
      setLoading(false);
      setError(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    
    // Set the source to trigger loading
    audio.src = audioUrl;

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, [audioUrl]);

  return { duration, loading, error };
}