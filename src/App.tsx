import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LandingPage } from './components/landing/LandingPage';
import { AudioPlayerDemo } from './components/ui/AudioPlayerDemo';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = React.useState(false);
  const [showDemo, setShowDemo] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (showDemo) {
    return <AudioPlayerDemo onBack={() => setShowDemo(false)} />;
  }

  if (user) {
    // Check if user is admin
    if (user.email === 'romain.wzk@gmail.com') {
      return <AdminDashboard />;
    }
    return <Dashboard />;
  }

  if (showAuth) {
    return <AuthForm onSuccess={() => setShowAuth(false)} onBack={() => setShowAuth(false)} />;
  }

  return (
    <div>
      <LandingPage onGetStarted={() => setShowAuth(true)} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;