import { Achievement } from '../types';

export const achievements: Achievement[] = [
  {
    id: 'weekly-reset-streak',
    title: 'Weekly Reset Streak',
    description: 'Complete at least 3 resets per week',
    badge: 'Calm Consistency',
    reward: 'Sense of regularity + a small ⭐ star displayed on the dashboard',
    type: 'individual',
    category: 'streak',
    requirements: {
      count: 3,
      timeframe: 'weekly',
      consecutive: false
    },
    icon: 'Calendar',
    color: 'from-teal-500 to-green-500'
  },
  {
    id: 'morning-focus-challenge',
    title: 'Morning Focus Challenge',
    description: 'Use a Focus protocol 3 mornings in a row',
    badge: 'Sharp Starter',
    reward: 'Enhanced morning routine badge',
    type: 'individual',
    category: 'focus',
    requirements: {
      count: 3,
      timeframe: 'daily',
      protocolType: 'focus',
      consecutive: true
    },
    icon: 'Sun',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'stress-reset-sprint',
    title: 'Stress Reset Sprint',
    description: 'Do a Calm protocol twice in the same week after stressful situations',
    badge: 'Stress Slayer',
    reward: 'Stress management mastery badge',
    type: 'individual',
    category: 'stress',
    requirements: {
      count: 2,
      timeframe: 'weekly',
      protocolType: 'calm',
      consecutive: false
    },
    icon: 'Shield',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'team-challenge',
    title: 'Team Challenge',
    description: 'Collective goal: 50 resets completed by the team in 1 month',
    badge: 'Team Recharge Award',
    reward: 'HR receives a mini-report: "Congratulations, your team has successfully completed the challenge."',
    type: 'team',
    category: 'team',
    requirements: {
      count: 50,
      timeframe: 'monthly',
      consecutive: false
    },
    icon: 'Users',
    color: 'from-orange-500 to-red-500'
  }
];