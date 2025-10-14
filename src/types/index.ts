export interface AudioProtocol {
  id: string;
  title: string;
  description: string;
  tagline: string;
  duration: number; // in minutes
  category: 'focus' | 'energy' | 'calm' | 'clarity' | 'reset';
  audioUrl: string;
  color: string;
  whenToUse?: string;
  science?: string;
  effect?: string;
  impact?: {
    calm: number;
    clarity: number;
    energy: number;
  };
}

export interface SessionData {
  id?: string;
  userId: string;
  protocolId: string;
  preCalmValue: number;
  preClarityValue: number;
  preEnergyValue: number;
  postCalmValue?: number;
  postClarityValue?: number;
  postEnergyValue?: number;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface UserStats {
  currentStreak: number;
  weeklyResets: number;
  completionRate: number;
  totalSessions: number;
  reconnectScore: number;
  calmAverage: number;
  clarityAverage: number;
  energyAverage: number;
  totalMinutes?: number;
  sessionQualities?: Array<{
    sessionQuality: number;
    date: string;
    id: string;
  }>;
  consistencyBonus?: number;
  weeklyResetsCount?: number;
  inactivityPenalty?: number;
  daysSinceLastSession?: number | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string;
  reward: string;
  type: 'individual' | 'team';
  category: 'streak' | 'focus' | 'stress' | 'team';
  requirements: {
    count: number;
    timeframe: 'daily' | 'weekly' | 'monthly';
    protocolType?: string;
    consecutive?: boolean;
  };
  icon: string;
  color: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  currentStreak?: number;
}