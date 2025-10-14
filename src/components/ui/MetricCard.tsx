import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend, 
  trendValue,
  className = ''
}: MetricCardProps) {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend === 'up' ? 'text-green-500' : 
            trend === 'down' ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}