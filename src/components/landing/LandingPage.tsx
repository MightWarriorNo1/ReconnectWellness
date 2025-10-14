import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Brain, 
  Heart, 
  TrendingUp, 
  Users, 
  Shield, 
  Play, 
  CheckCircle, 
  ArrowRight,
  Star,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { isDark, toggleTheme } = useTheme();

  const features = [
    {
      icon: Brain,
      title: 'Science-Backed Protocols',
      description: 'Evidence-based audio sessions designed to optimize mental performance and well-being.'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track progress with detailed metrics on calm, clarity, and energy levels.'
    },
    {
      icon: Users,
      title: 'Team Insights',
      description: 'HR dashboard with aggregated wellness data and engagement metrics.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Enterprise-grade security with complete data privacy and compliance.'
    }
  ];

  const stats = [
    { value: '87%', label: 'Improved Focus' },
    { value: '92%', label: 'Reduced Stress' },
    { value: '78%', label: 'Better Sleep' },
    { value: '95%', label: 'User Satisfaction' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Head of People Operations',
      company: 'TechCorp',
      content: 'Reconnect has transformed our workplace wellness program. Employee engagement is up 40% and stress-related absences have dropped significantly.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Software Engineer',
      company: 'InnovateLabs',
      content: 'The 15-minute focus sessions have become part of my daily routine. My productivity and mental clarity have never been better.',
      rating: 5
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Chief Wellness Officer',
      company: 'HealthFirst',
      content: 'Finally, a wellness platform that provides real data and measurable outcomes. The ROI on employee well-being is clear.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <motion.header 
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Reconnect
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {isDark ? '☀️' : '🌙'}
              </motion.button>
              <motion.button
                onClick={onGetStarted}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6">
                Workplace
                <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                  {' '}Wellness
                </span>
                <br />
                Redefined
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                Transform your team's performance with science-backed wellness protocols. 
                Boost focus, reduce stress, and create a thriving workplace culture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  onClick={onGetStarted}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16 opacity-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Today's Progress</h3>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Calm</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 sm:w-20 lg:w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="w-14 sm:w-16 lg:w-20 h-2 bg-teal-500 rounded-full"></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">8.2</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Clarity</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 sm:w-20 lg:w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="w-12 sm:w-14 lg:w-18 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">7.8</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Energy</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 sm:w-20 lg:w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="w-15 sm:w-18 lg:w-22 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">9.1</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">85</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Reconnect Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-teal-600 mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4"
            >
              Built for Modern Workplaces
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4"
            >
              Comprehensive wellness solution that drives measurable results for both employees and organizations
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Simple. Effective. Measurable.
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Get started in minutes, see results in days
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                1. Set Your Baseline
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Rate your current calm, clarity, and energy levels before each session
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                2. Choose Your Protocol
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Select from focus, energy, calm, or clarity sessions tailored to your needs
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                3. Track Your Progress
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                See immediate improvements and build lasting wellness habits
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Trusted by Leading Organizations
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              See what our customers are saying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-teal-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Transform Your Workplace?
            </h2>
            <p className="text-lg sm:text-xl text-teal-100 mb-6 sm:mb-8">
              Join thousands of organizations already using Reconnect to boost employee well-being and performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-white text-teal-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-colors duration-200 shadow-lg"
              >
                Start Your Free Trial
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-teal-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200">
                Schedule Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold">Reconnect</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Transforming workplace wellness through science-backed protocols and data-driven insights.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400">
            <p>&copy; 2025 Reconnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}