import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color: string;
  className?: string;
}

export function CircularProgress({ 
  value, 
  size = 120, 
  strokeWidth = 8, 
  color,
  className = ''
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity="0.2"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
         strokeDasharray={circumference}
         strokeDashoffset={circumference - (value / 100) * circumference}
         initial={{ strokeDashoffset: circumference }}
         animate={{ strokeDashoffset: offset }}
         transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}