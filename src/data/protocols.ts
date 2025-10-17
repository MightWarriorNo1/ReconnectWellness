import { AudioProtocol } from '../types';
import { AudioStorageService } from '../lib/audioStorage';

const audioProtocols: AudioProtocol[] = [
  {
    id: 'presence-drop',
    title: 'Presence Drop',
    description: 'A fast reset using breath and posture to bring you back to calm and clarity before your next task.',
    tagline: 'Cut stress instantly.',
    duration: 3,
    category: 'reset',
    audioUrl: AudioStorageService.getAudioUrl('Quick Reset.mp3'),
    color: 'from-blue-500 to-blue-600',
    whenToUse: 'Before a tense call, after a tough exchange, or between tasks',
    science: 'Physiological sigh reduces CO₂ and downregulates amygdala reactivity. Followed by coherent breathing (4–6), activating the vagus nerve for rapid calming.',
    effect: 'Stress interrupted, nervous system reset, clarity starting to return',
    impact: {
      calm: 80,
      clarity: 40,
      energy: 20
    }
  },
  {
    id: 'peak-focus',
    title: 'Peak Focus',
    description: 'Breathing + visual drills that steady your nerves and boost clarity before deep work or key meetings.',
    tagline: 'Lock in sharp concentration.',
    duration: 5,
    category: 'focus',
    audioUrl: AudioStorageService.getAudioUrl('PeakFocus Meditation.mp3'),
    color: 'from-purple-500 to-purple-600',
    whenToUse: 'Just before a high-stakes meeting, presentation, or deep work block',
    science: 'Box breathing (4–4–4–4) balances O₂/CO₂, stabilizes HRV. Visual fixation + zoom drills train prefrontal control and attentional flexibility.',
    effect: 'Structured, steady focus — precise, clear, resilient under pressure',
    impact: {
      calm: 50,
      clarity: 80,
      energy: 40
    }
  },
  {
    id: 'reset-recharge',
    title: 'Reset & Recharge',
    description: 'Energizing breath and light movement to clear fatigue and restore sustainable energy without caffeine.',
    tagline: 'Beat the afternoon slump.',
    duration: 6,
    category: 'energy',
    audioUrl: AudioStorageService.getAudioUrl('ResetRecharge.mp3'),
    color: 'from-amber-500 to-amber-600',
    whenToUse: 'Early afternoon, low-energy moments, or before starting a new block',
    science: 'Stimulating breathing (inhale 3s / exhale 2s) supports dopamine release and mild sympathetic activation. Light movement (stretches, twists) engages circulation and proprioception. Balanced breathing (4–4) restores coherence.',
    effect: 'Fatigue cleared, sustainable energy restored — alert, sharp, stable',
    impact: {
      calm: 50,
      clarity: 40,
      energy: 80
    }
  },
  {
    id: 'unplug-recover',
    title: 'Unplug & Recover',
    description: 'Slow breathing and guided body release to let go of tension and shift fully into recovery mode.',
    tagline: 'Switch off and release.',
    duration: 8,
    category: 'calm',
    audioUrl: AudioStorageService.getAudioUrl('Unplug and Recover.mp3'),
    color: 'from-slate-500 to-slate-600',
    whenToUse: 'At the end of the workday, after multiple calls, or before personal time',
    science: '4–7–8 breathing slows heart rate, activates parasympathetic tone. Progressive muscle release lowers residual tension, signaling safety to the brain. Extended exhalations deepen vagal activity.',
    effect: 'Full downshift — body heavy, mind quiet, nervous system restored',
    impact: {
      calm: 80,
      clarity: 30,
      energy: 60
    }
  },
  {
    id: 'back-to-baseline',
    title: 'Back to Baseline',
    description: 'A complete reset protocol blending breath and relaxation to restore balance across calm, clarity, and energy.',
    tagline: 'Full system reset.',
    duration: 10,
    category: 'reset',
    audioUrl: AudioStorageService.getAudioUrl('BackToBaseline.mp3'),
    color: 'from-indigo-500 to-indigo-600',
    whenToUse: 'End of a demanding week, after acute stress, or during mental saturation',
    science: 'Coherent breathing (4–6) improves HRV and balances autonomic tone. Gentle self-contact supports vagal activation through interoceptive touch. Progressive relaxation reduces sympathetic charge.',
    effect: 'Calm, clarity, and energy re-aligned — a full nervous system reset',
    impact: {
      calm: 70,
      clarity: 70,
      energy: 70
    }
  },
];

export { audioProtocols };