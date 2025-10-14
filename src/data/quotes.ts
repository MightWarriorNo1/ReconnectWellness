export const motivationalQuotes = [
  "Peak performance is not about perfection. It's about consistency.",
  "Every reset is a step forward. Every session builds resilience.",
  "Your mind is your most powerful tool. Keep it sharp.",
  "Progress, not perfection. Growth, not comparison.",
  "Small daily improvements lead to staggering yearly results.",
  "The strongest people make time to train their minds.",
  "Clarity comes from action, not thought alone.",
  "Your potential is unlimited. Your growth is intentional.",
  "Excellence is not a skill, it's an attitude cultivated daily.",
  "Mental fitness requires the same discipline as physical fitness.",
  "Reset your mind. Reclaim your power. Reconnect with purpose.",
  "Champions are made in the moments when nobody is watching.",
  "Your mental game determines your life game.",
  "Invest in your mind. It's the best investment you'll ever make.",
  "Consistency beats intensity. Small steps create big changes."
];

export function getDailyQuote(): string {
  const today = new Date().toDateString();
  const hash = Array.from(today).reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const index = Math.abs(hash) % motivationalQuotes.length;
  return motivationalQuotes[index];
}