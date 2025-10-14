import React from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Play, Star, Info } from 'lucide-react';
import { audioProtocols } from '../../data/protocols';
import { AudioProtocol } from '../../types';
import { useFavorites } from '../../hooks/useFavorites';
import { useRecentActivity } from '../../hooks/useRecentActivity';

interface ProtocolLibraryProps {
  onSelectProtocol: (protocol: AudioProtocol) => void;
}

export function ProtocolLibrary({ onSelectProtocol }: ProtocolLibraryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { suggestedProtocols, getSuggestionReason } = useRecentActivity();

  const categories = [
    { id: 'all', label: 'All', count: audioProtocols.length },
    { id: 'focus', label: 'Focus', count: audioProtocols.filter(p => p.category === 'focus').length },
    { id: 'energy', label: 'Energy', count: audioProtocols.filter(p => p.category === 'energy').length },
    { id: 'calm', label: 'Calm', count: audioProtocols.filter(p => p.category === 'calm').length },
    { id: 'reset', label: 'Reset', count: audioProtocols.filter(p => p.category === 'reset').length }
  ];

  const filteredProtocols = audioProtocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getProtocolGradient = (category: string) => {
    switch (category) {
      case 'focus':
        return 'from-purple-500 to-indigo-600';
      case 'energy':
        return 'from-orange-500 to-amber-600';
      case 'calm':
        return 'from-emerald-500 to-teal-600';
      case 'reset':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
  };

  const ProtocolCard = ({ protocol, isRecommended = false }: { protocol: AudioProtocol; isRecommended?: boolean }) => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-br ${getProtocolGradient(protocol.category)} p-6 text-white relative`}>
        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(protocol.id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <Star 
            className={`w-4 h-4 ${
              isFavorite(protocol.id) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-white'
            }`}
          />
        </button>

        {/* Duration */}
        <div className="flex items-center space-x-1 text-white/90 text-sm mb-3">
          <Clock className="w-4 h-4" />
          <span>{formatDuration(protocol.duration)}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 pr-8">
          {protocol.title}
        </h3>

        {/* Tagline */}
        <p className="text-white/90 text-sm italic mb-4">
          "{protocol.tagline}"
        </p>

        {/* Play button */}
        <button
          onClick={() => onSelectProtocol(protocol)}
          className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <Play className="w-5 h-5 text-white ml-0.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
          {protocol.description}
        </p>

        {/* Impact indicators */}
        {protocol.impact && (
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Calm {protocol.impact.calm}%
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Clarity {protocol.impact.clarity}%
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Energy {protocol.impact.energy}%
              </span>
            </div>
          </div>
        )}

        {/* Category tag */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            protocol.category === 'focus' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
            protocol.category === 'energy' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
            protocol.category === 'calm' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
            protocol.category === 'reset' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}>
            {protocol.category.charAt(0).toUpperCase() + protocol.category.slice(1)}
          </span>

          {isRecommended && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              <Info className="w-3 h-3 mr-1" />
              Suggested
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Protocol Library
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose from our collection of wellness protocols
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search protocols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </motion.div>

      {/* Category Filter */}
      <motion.div 
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
              selectedCategory === category.id
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span className="font-medium">{category.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedCategory === category.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {category.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Suggested Protocols Section */}
      {suggestedProtocols.length > 0 && !searchTerm && selectedCategory === 'all' && (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Suggested for You
            </h3>
          </div>
          
          {/* Suggestion reason */}
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
            <p className="text-sm text-teal-700 dark:text-teal-300">
              {suggestedProtocols.length > 0 && getSuggestionReason(suggestedProtocols[0])}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedProtocols.map((protocol) => (
              <ProtocolCard
                key={protocol.id}
                protocol={protocol}
                isRecommended={true}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* All Protocols */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {!searchTerm && selectedCategory === 'all' && suggestedProtocols.length > 0 && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Protocols
          </h3>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProtocols.map((protocol, index) => (
            <motion.div
              key={protocol.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.4 + index * 0.1
              }}
            >
              <ProtocolCard protocol={protocol} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredProtocols.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No protocols found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
          >
            Clear filters
          </button>
        </motion.div>
      )}
    </div>
  );
}