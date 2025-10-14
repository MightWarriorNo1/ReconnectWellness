import { AudioProtocol, UserStats } from '../types';
import { audioProtocols } from '../data/protocols';

export function getRecommendedProtocols(stats: UserStats): AudioProtocol[] {
  const hour = new Date().getHours();
  const recommendations: AudioProtocol[] = [];
  
  console.log('🕐 Time-based recommendations for hour:', hour);
  console.log('📊 User stats:', { 
    energy: stats.energyAverage, 
    calm: stats.calmAverage, 
    clarity: stats.clarityAverage 
  });
  
  // Time-based recommendations with more granular logic
  if (hour >= 5 && hour < 9) {
    // Early morning (5-9 AM): Focus and Reset for productivity
    const focusProtocol = audioProtocols.find(p => p.category === 'focus');
    const resetProtocol = audioProtocols.find(p => p.category === 'reset');
    
    if (focusProtocol) recommendations.push(focusProtocol);
    if (resetProtocol) recommendations.push(resetProtocol);
    console.log('🌅 Early morning: Focus + Reset');
  } else if (hour >= 9 && hour < 12) {
    // Late morning (9-12 PM): Focus and Energy for peak performance
    const focusProtocol = audioProtocols.find(p => p.category === 'focus');
    const energyProtocol = audioProtocols.find(p => p.category === 'energy');
    
    if (focusProtocol) recommendations.push(focusProtocol);
    if (energyProtocol) recommendations.push(energyProtocol);
    console.log('☀️ Late morning: Focus + Energy');
  } else if (hour >= 12 && hour < 15) {
    // Early afternoon (12-3 PM): Energy and Reset to overcome post-lunch slump
    const energyProtocol = audioProtocols.find(p => p.category === 'energy');
    const resetProtocol = audioProtocols.find(p => p.category === 'reset');
    
    if (energyProtocol) recommendations.push(energyProtocol);
    if (resetProtocol) recommendations.push(resetProtocol);
    console.log('🍽️ Early afternoon: Energy + Reset');
  } else if (hour >= 15 && hour < 18) {
    // Late afternoon (3-6 PM): Energy and Focus for end-of-day productivity
    const energyProtocol = audioProtocols.find(p => p.category === 'energy');
    const focusProtocol = audioProtocols.find(p => p.category === 'focus');
    
    if (energyProtocol) recommendations.push(energyProtocol);
    if (focusProtocol) recommendations.push(focusProtocol);
    console.log('🌆 Late afternoon: Energy + Focus');
  } else if (hour >= 18 && hour < 21) {
    // Early evening (6-9 PM): Calm and Reset for transition to relaxation
    const calmProtocol = audioProtocols.find(p => p.category === 'calm');
    const resetProtocol = audioProtocols.find(p => p.category === 'reset');
    
    if (calmProtocol) recommendations.push(calmProtocol);
    if (resetProtocol) recommendations.push(resetProtocol);
    console.log('🌆 Early evening: Calm + Reset');
  } else {
    // Late evening/Night (9 PM - 5 AM): Calm and Reset for wind-down
    const calmProtocol = audioProtocols.find(p => p.category === 'calm');
    const resetProtocol = audioProtocols.find(p => p.category === 'reset');
    
    if (calmProtocol) recommendations.push(calmProtocol);
    if (resetProtocol) recommendations.push(resetProtocol);
    console.log('🌙 Late evening/Night: Calm + Reset');
  }
  
  // Score-based recommendations - prioritize based on lowest wellness dimensions
  const wellnessScores = [
    { dimension: 'energy', score: stats.energyAverage, category: 'energy' },
    { dimension: 'calm', score: stats.calmAverage, category: 'calm' }
  ];
  
  // Sort by lowest scores first
  wellnessScores.sort((a, b) => a.score - b.score);
  console.log('📈 Wellness scores (sorted):', wellnessScores);
  
  // Add protocols for lowest scoring dimensions (if they're not already included)
  wellnessScores.forEach(({ dimension, score, category }) => {
    if (score > 0 && score < 6) {
      const protocol = audioProtocols.find(p => p.category === category);
      if (protocol && !recommendations.includes(protocol)) {
        recommendations.unshift(protocol); // Add to beginning for priority
        console.log(`🔴 Low ${dimension} score (${score}), prioritizing ${protocol.title}`);
      }
    }
  });
  
  // Special case: if all scores are low, suggest Reset protocol
  const lowScores = wellnessScores.filter(ws => ws.score > 0 && ws.score < 6);
  if (lowScores.length >= 2) {
    const resetProtocol = audioProtocols.find(p => p.category === 'reset');
    if (resetProtocol && !recommendations.includes(resetProtocol)) {
      recommendations.unshift(resetProtocol);
      console.log('🔄 Multiple low scores detected, suggesting Reset protocol');
    }
  }
  
  // Ensure we have exactly 2-3 recommendations
  if (recommendations.length < 2) {
    const remaining = audioProtocols.filter(p => !recommendations.includes(p));
    recommendations.push(...remaining.slice(0, 3 - recommendations.length));
    console.log('➕ Filling recommendations to minimum count');
  }
  
  // Limit to 3 recommendations and remove duplicates
  const uniqueRecommendations = recommendations.filter((protocol, index, self) => 
    index === self.findIndex(p => p.id === protocol.id)
  );
  
  const finalRecommendations = uniqueRecommendations.slice(0, 3);
  console.log('✅ Final recommendations:', finalRecommendations.map(p => p.title));
  
  return finalRecommendations;
}