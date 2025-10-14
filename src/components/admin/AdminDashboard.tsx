import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Building2, 
  BarChart3, 
  MessageSquare, 
  Search, 
  Download, 
  Eye, 
  X,
  TrendingUp,
  Activity,
  Award,
  Calendar,
  Star,
  
  Menu,
  X as CloseIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: string;
  is_active?: boolean;
  globalScore: number;
  sessionCount: number;
  badges: string[];
  lastActive: string | null;
}

interface CompanyData {
  name: string;
  userCount: number;
  activeUsers: number;
  totalSessions: number;
  averageScore: number;
  weeklyActiveUsers?: number;
  monthlyActiveUsers?: number;
  averageCalm?: number;
  averageClarity?: number;
  averageEnergy?: number;
  averageSessionsPerUser?: number;
}

interface UsageMetrics {
  activePercentage: number;
  totalResets: number;
  averageDelta: number;
  averageScore: number;
  weeklyActivity: Array<{ day: string; count: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  activity7?: Array<{ label: string; count: number; avgScore: number }>;
  activity30?: Array<{ label: string; count: number; avgScore: number }>;
  timeOfDay?: { morning: number; afternoon: number; evening: number };
  needsUsage?: Array<{ label: string; percent: number; count: number }>;
  evolution7?: Array<{ label: string; calm: number; clarity: number; energy: number; score: number }>;
  evolution30?: Array<{ label: string; calm: number; clarity: number; energy: number; score: number }>;
  leaderboard?: Array<{ company: string; totalSessions: number }>;
  companyScoreEvolution?: Array<{
    company: string;
    evolution7: Array<{ label: string; score: number }>;
    evolution30: Array<{ label: string; score: number }>;
  }>;
}

export function AdminDashboard() {
  const { signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trendRange, setTrendRange] = useState<'7' | '30'>('7');
  const [selectedCompanyForTrend, setSelectedCompanyForTrend] = useState<string>('Global');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteCompanyDomain, setInviteCompanyDomain] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load users with their session data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        // Check if it's a recursion error
        if (profilesError.code === '42P17') {
          const errorMsg = 'Database policy recursion detected. Please apply the admin policy fix.';
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        throw profilesError;
      }

      console.log("PROFILES", profiles);
      
      // Load all sessions for calculations
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error loading sessions:', sessionsError);
        // Check if it's a recursion error
        if (sessionsError.code === '42P17') {
          const errorMsg = 'Database policy recursion detected. Please apply the admin policy fix.';
          setError(errorMsg);
          throw new Error(errorMsg);
        }
        throw sessionsError;
      }

      console.log("SESSIONS", sessions);

      // Process user data
      const processedUsers = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          const userSessions = (sessions || []).filter((s: any) => s.user_id === profile.id);
          const completedSessions = userSessions.filter((s: any) => s.completed);
          
          // Calculate global score
          let globalScore = 0;
          if (completedSessions.length > 0) {
            const avgCalm = completedSessions.reduce((sum: number, s: any) => sum + (s.post_calm || 0), 0) / completedSessions.length;
            const avgClarity = completedSessions.reduce((sum: number, s: any) => sum + (s.post_clarity || 0), 0) / completedSessions.length;
            const avgEnergy = completedSessions.reduce((sum: number, s: any) => sum + (s.post_energy || 0), 0) / completedSessions.length;
            globalScore = Math.round(((avgCalm + avgClarity + avgEnergy) / 3) * 10);
          }

          // Assign badges based on performance
          const badges = [];
          if (completedSessions.length >= 10) badges.push('Dedicated User');
          if (globalScore >= 80) badges.push('High Performer');
          if (userSessions.length >= 20) badges.push('Wellness Champion');
          if (completedSessions.length >= 5) badges.push('Active Member');

          return {
            ...profile,
            globalScore,
            sessionCount: completedSessions.length,
            badges,
            lastActive: userSessions.length > 0 ? (userSessions[0] as any).created_at : null,
            is_active: (profile as any).is_active ?? true
          };
        })
      );

      setUsers(processedUsers);

      // Calculate company data (simplified - group by email domain)
      const companyMap = new Map<string, CompanyData>();
      processedUsers.forEach(user => {
        const domain = user.email.split('@')[1];
        if (!companyMap.has(domain)) {
          companyMap.set(domain, {
            name: domain,
            userCount: 0,
            activeUsers: 0,
            totalSessions: 0,
            averageScore: 0
          });
        }
        
        const company = companyMap.get(domain)!;
        company.userCount++;
        if (user.sessionCount > 0) company.activeUsers++;
        company.totalSessions += user.sessionCount;
      });

      // Calculate extended metrics per company
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);

      companyMap.forEach((company, domain) => {
        const companyUsers = processedUsers.filter(u => u.email.endsWith(domain));
        const activeUsers = companyUsers.filter(u => u.sessionCount > 0);
        company.averageScore = activeUsers.length > 0
          ? Math.round(activeUsers.reduce((sum, u) => sum + u.globalScore, 0) / activeUsers.length)
          : 0;

        const companyUserIds = new Set(companyUsers.map(u => u.id));
        const companySessions = (sessions || []).filter((s: any) => companyUserIds.has(s.user_id));

        const weeklyActiveUserIds = new Set(
          companySessions
            .filter((s: any) => new Date(s.created_at) >= weekAgo && s.completed)
            .map((s: any) => s.user_id)
        );
        const monthlyActiveUserIds = new Set(
          companySessions
            .filter((s: any) => new Date(s.created_at) >= monthAgo && s.completed)
            .map((s: any) => s.user_id)
        );
        company.weeklyActiveUsers = weeklyActiveUserIds.size;
        company.monthlyActiveUsers = monthlyActiveUserIds.size;

        const completedCompanySessions = companySessions.filter((s: any) => s.completed && s.post_calm != null && s.post_clarity != null && s.post_energy != null);
        if (completedCompanySessions.length > 0) {
          const calmSum = completedCompanySessions.reduce((sum: number, s: any) => sum + (s.post_calm || 0), 0);
          const claritySum = completedCompanySessions.reduce((sum: number, s: any) => sum + (s.post_clarity || 0), 0);
          const energySum = completedCompanySessions.reduce((sum: number, s: any) => sum + (s.post_energy || 0), 0);
          company.averageCalm = Math.round((calmSum / completedCompanySessions.length) * 10) / 10;
          company.averageClarity = Math.round((claritySum / completedCompanySessions.length) * 10) / 10;
          company.averageEnergy = Math.round((energySum / completedCompanySessions.length) * 10) / 10;
        } else {
          company.averageCalm = 0;
          company.averageClarity = 0;
          company.averageEnergy = 0;
        }

        company.averageSessionsPerUser = company.userCount > 0 ? Math.round((company.totalSessions / company.userCount) * 10) / 10 : 0;
      });

      setCompanies(Array.from(companyMap.values()));

      // Calculate usage metrics
      const totalUsers = processedUsers.length;
      const activeUsers = processedUsers.filter((u: any) => u.sessionCount > 0).length;
      const totalResets = (sessions || []).filter((s: any) => s.completed).length;
      
      // Calculate average delta (improvement)
      const completedSessions = (sessions || []).filter((s: any) => 
        s.completed && s.pre_calm && s.post_calm && s.pre_clarity && s.post_clarity && s.pre_energy && s.post_energy
      );
      
      const averageDelta = completedSessions.length > 0
        ? completedSessions.reduce((sum: number, s: any) => {
            const calmDelta = (s.post_calm || 0) - (s.pre_calm || 0);
            const clarityDelta = (s.post_clarity || 0) - (s.pre_clarity || 0);
            const energyDelta = (s.post_energy || 0) - (s.pre_energy || 0);
            return sum + ((calmDelta + clarityDelta + energyDelta) / 3);
          }, 0) / completedSessions.length
        : 0;

      const averageScore = processedUsers.length > 0
        ? processedUsers.reduce((sum: number, u: any) => sum + u.globalScore, 0) / processedUsers.length
        : 0;

      // Helper to build activity series for N days
      const buildActivity = (days: number) => {
        return Array.from({ length: days }, (_, i) => {
        const date = new Date();
          date.setDate(date.getDate() - ((days - 1) - i));
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
          const daySessions = (sessions || []).filter((s: any) => {
          const sessionDate = new Date(s.created_at);
          return sessionDate >= dayStart && sessionDate <= dayEnd && s.completed;
          });
          const count = daySessions.length;
          let avgScore = 0;
          if (count > 0) {
            const sum = daySessions.reduce((acc: number, s: any) => acc + Math.round(((s.post_calm + s.post_clarity + s.post_energy) / 3) * 10), 0);
            avgScore = Math.round(sum / count);
          }
          return { label: days === 7 ? format(date, 'EEE') : format(date, 'MM-dd'), count, avgScore };
        });
      };

      const weeklyActivity = buildActivity(7).map(d => ({ day: d.label, count: d.count }));
      const activity7 = buildActivity(7);
      const activity30 = buildActivity(30);

      // Time-of-day analysis (morning 5-11, afternoon 12-17, evening 18-4)
      const timeOfDay = { morning: 0, afternoon: 0, evening: 0 };
      (sessions || []).forEach((s: any) => {
        if (!s.completed) return;
        const h = new Date(s.created_at).getHours();
        if (h >= 5 && h <= 11) timeOfDay.morning++;
        else if (h >= 12 && h <= 17) timeOfDay.afternoon++;
        else timeOfDay.evening++;
      });

      // Needs usage by protocol category
      const catCount: Record<string, number> = { reset: 0, focus: 0, energy: 0, calm: 0 };
      const completedAll = (sessions || []).filter((s: any) => s.completed);
      completedAll.forEach((s: any) => {
        // infer by protocol_id prefix or later join if needed; we count by post values presence only if category unknown
        const protocol = s.protocol_id || '';
        if (protocol.includes('reset')) catCount.reset++;
        else if (protocol.includes('focus')) catCount.focus++;
        else if (protocol.includes('energy')) catCount.energy++;
        else if (protocol.includes('calm')) catCount.calm++;
      });
      const totalNeeds = Object.values(catCount).reduce((a, b) => a + b, 0) || 1;
      const needsUsage = [
        { label: 'Quick Reset', percent: Math.round((catCount.reset / totalNeeds) * 100), count: catCount.reset },
        { label: 'Deep Focus', percent: Math.round((catCount.focus / totalNeeds) * 100), count: catCount.focus },
        { label: 'Energy Boost', percent: Math.round((catCount.energy / totalNeeds) * 100), count: catCount.energy },
        { label: 'Stress Relief', percent: Math.round((catCount.calm / totalNeeds) * 100), count: catCount.calm },
      ];

      // Evolution of Calm/Clarity/Energy/Score
      const buildEvolution = (days: number) => {
        return Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - ((days - 1) - i));
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          const daySessions = completedAll.filter((s: any) => {
            const d = new Date(s.created_at);
            return d >= dayStart && d <= dayEnd && s.post_calm != null && s.post_clarity != null && s.post_energy != null;
          });
          const count = daySessions.length;
          let calm = 0, clarity = 0, energy = 0, score = 0;
          if (count > 0) {
            calm = Math.round((daySessions.reduce((acc: number, s: any) => acc + s.post_calm, 0) / count) * 10) / 10;
            clarity = Math.round((daySessions.reduce((acc: number, s: any) => acc + s.post_clarity, 0) / count) * 10) / 10;
            energy = Math.round((daySessions.reduce((acc: number, s: any) => acc + s.post_energy, 0) / count) * 10) / 10;
            score = Math.round(daySessions.reduce((acc: number, s: any) => acc + Math.round(((s.post_calm + s.post_clarity + s.post_energy) / 3) * 10), 0) / count);
          }
          return { label: days === 7 ? format(date, 'EEE') : format(date, 'MM-dd'), calm, clarity, energy, score };
        });
      };

      const evolution7 = buildEvolution(7);
      const evolution30 = buildEvolution(30);

      // Company leaderboard (by total sessions)
      const leaderboard = Array.from((companyMap.values()))
        .map(c => ({ company: c.name, totalSessions: c.totalSessions }))
        .sort((a, b) => b.totalSessions - a.totalSessions)
        .slice(0, 10);

      // Per-company Reconnect Score evolution
      const buildCompanyScoreEvolution = (domain: string, days: number) => {
        const companyUsers = processedUsers.filter(u => u.email.endsWith(domain));
        const companyUserIds = new Set(companyUsers.map(u => u.id));
        return Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - ((days - 1) - i));
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          const daySessions = (sessions || []).filter((s: any) => {
            if (!companyUserIds.has(s.user_id)) return false;
            const d = new Date(s.created_at);
            return s.completed && d >= dayStart && d <= dayEnd && s.post_calm != null && s.post_clarity != null && s.post_energy != null;
          });
          const count = daySessions.length;
          let score = 0;
          if (count > 0) {
            score = Math.round(daySessions.reduce((acc: number, s: any) => acc + Math.round(((s.post_calm + s.post_clarity + s.post_energy) / 3) * 10), 0) / count);
          }
          return { label: days === 7 ? format(date, 'EEE') : format(date, 'MM-dd'), score };
        });
      };

      const companyScoreEvolution = Array.from(companyMap.keys()).map(domain => ({
        company: domain,
        evolution7: buildCompanyScoreEvolution(domain, 7),
        evolution30: buildCompanyScoreEvolution(domain, 30)
      }));

      // Score distribution - count individual session scores, not user averages
      const scoreRanges = [
        { range: '0-20', count: 0 },
        { range: '21-40', count: 0 },
        { range: '41-60', count: 0 },
        { range: '61-80', count: 0 },
        { range: '81-100', count: 0 }
      ];

      // Count individual session scores instead of user averages
      completedSessions.forEach((session: any) => {
        const sessionScore = Math.round(((session.post_calm + session.post_clarity + session.post_energy) / 3) * 10);
        if (sessionScore <= 20) scoreRanges[0].count++;
        else if (sessionScore <= 40) scoreRanges[1].count++;
        else if (sessionScore <= 60) scoreRanges[2].count++;
        else if (sessionScore <= 80) scoreRanges[3].count++;
        else scoreRanges[4].count++;
      });

      setMetrics({
        activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
        totalResets,
        averageDelta: Math.round(averageDelta * 10) / 10,
        averageScore: Math.round(averageScore),
        weeklyActivity,
        scoreDistribution: scoreRanges,
        activity7,
        activity30,
        timeOfDay,
        needsUsage,
        evolution7,
        evolution30,
        leaderboard,
        companyScoreEvolution
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      // Show user-friendly error message
      setUsers([]);
      setCompanies([]);
      setMetrics({
        activePercentage: 0,
        totalResets: 0,
        averageDelta: 0,
        averageScore: 0,
        weeklyActivity: [],
        scoreDistribution: []
      });
      if (!error) {
        setError('An unknown error occurred while loading admin data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportFeedback = () => {
    // Create CSV content
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,User,Feedback,Rating\n" +
      "2025-01-15,john@example.com,Great app! Really helps with focus,5\n" +
      "2025-01-14,sarah@company.com,Love the calm sessions,4\n" +
      "2025-01-13,mike@startup.io,Could use more variety in protocols,3\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "feedback_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderUsersTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Database Configuration Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
                {error.includes('recursion') && (
                  <div className="mt-3">
                    <p className="font-medium">To fix this, run the following SQL in your Supabase SQL Editor:</p>
                    <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900 p-3 rounded overflow-x-auto">
{`-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can read all sessions" ON sessions;

-- Create admin function (non-recursive)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'email' = 'romain.wzk@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies
CREATE POLICY "Admin users can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (is_admin_user());

CREATE POLICY "Admin users can read all sessions"
  ON sessions FOR SELECT TO authenticated
  USING (is_admin_user());`}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Invite */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 sm:text-left text-center">
            {filteredUsers.length} users
          </div>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm"
          >
            Invite Users
          </button>
        </div>
      </div>

      {/* Users Table - Mobile Responsive */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Global Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Badges
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`text-2xl font-bold ${
                        user.globalScore >= 80 ? 'text-green-600' :
                        user.globalScore >= 60 ? 'text-blue-600' :
                        user.globalScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {user.globalScore}
                      </div>
                      <div className="ml-2 text-sm text-gray-500">/100</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.sessionCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.badges.slice(0, 2).map((badge, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                        >
                          {badge}
                        </span>
                      ))}
                      {user.badges.length > 2 && (
                        <span className="text-xs text-gray-500">+{user.badges.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastActive ? format(new Date(user.lastActive), 'MMM d, yyyy') : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      {!user.is_active ? (
                        <button
                          onClick={async () => {
                            try {
                              const { error } = await (supabase as any).from('profiles').update({ is_active: true }).eq('id', user.id);
                              if (error) throw error;
                              await loadAdminData();
                            } catch (e: any) {
                              console.error(e);
                              alert(`Failed to reactivate user: ${e?.message || 'Unknown error'}`);
                            }
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Reactivate user"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              const { error } = await (supabase as any).from('profiles').update({ is_active: false }).eq('id', user.id);
                              if (error) throw error;
                              await loadAdminData();
                            } catch (e: any) {
                              console.error(e);
                              alert(`Failed to deactivate user: ${e?.message || 'Unknown error'}`);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Deactivate user"
                        >
                          Deactivate
                        </button>
                      )}
                      {/* Role selection removed */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          <div className="p-4 space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.full_name || 'No name'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 p-2"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {!user.is_active ? (
                      <button
                        onClick={async () => {
                          try {
                            const { error } = await (supabase as any).from('profiles').update({ is_active: true }).eq('id', user.id);
                            if (error) throw error;
                            await loadAdminData();
                          } catch (e: any) {
                            console.error(e);
                            alert(`Failed: ${e?.message || 'Unknown error'}`);
                          }
                        }}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            const { error } = await (supabase as any).from('profiles').update({ is_active: false }).eq('id', user.id);
                            if (error) throw error;
                            await loadAdminData();
                          } catch (e: any) {
                            console.error(e);
                            alert(`Failed: ${e?.message || 'Unknown error'}`);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Deactivate
                      </button>
                    )}
                    {/* Role selection removed */}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className={`text-xl font-bold ${
                      user.globalScore >= 80 ? 'text-green-600' :
                      user.globalScore >= 60 ? 'text-blue-600' :
                      user.globalScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {user.globalScore}
                    </div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.sessionCount}
                    </div>
                    <div className="text-xs text-gray-500">Sessions</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.badges.length}
                    </div>
                    <div className="text-xs text-gray-500">Badges</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {user.badges.slice(0, 3).map((badge, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                    >
                      {badge}
                    </span>
                  ))}
                  {user.badges.length > 3 && (
                    <span className="text-xs text-gray-500">+{user.badges.length - 3}</span>
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last active: {user.lastActive ? format(new Date(user.lastActive), 'MMM d, yyyy') : 'Never'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function exportCompaniesCsv() {
    const headers = [
      'Company','Users','Active Users','Weekly Active','Monthly Active','Total Sessions','Avg Sessions/User','Avg Score','Avg Calm','Avg Clarity','Avg Energy'
    ];
    const rows = companies.map(c => [
      c.name,
      c.userCount,
      c.activeUsers,
      c.weeklyActiveUsers ?? 0,
      c.monthlyActiveUsers ?? 0,
      c.totalSessions,
      c.averageSessionsPerUser ?? 0,
      c.averageScore,
      c.averageCalm ?? 0,
      c.averageClarity ?? 0,
      c.averageEnergy ?? 0
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'company_metrics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const renderCompaniesTab = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Companies</h2>
        <button
          onClick={exportCompaniesCsv}
          className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export CSV</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {companies.map((company, index) => (
          <motion.div
            key={company.name}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {company.name}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {company.userCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Users</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {company.activeUsers}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {company.totalSessions}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {company.averageScore}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-teal-600">
                  {company.weeklyActiveUsers || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Weekly Active</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-teal-600">
                  {company.monthlyActiveUsers || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monthly Active</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {company.averageSessionsPerUser ?? 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Sessions/User</div>
              </div>
              <div>
                <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Calm {company.averageCalm ?? 0} · Clarity {company.averageClarity ?? 0} · Energy {company.averageEnergy ?? 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Avg Post-Session</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active %</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {metrics?.activePercentage || 0}%
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Resets</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {metrics?.totalResets || 0}
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Avg Δ</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            +{metrics?.averageDelta || 0}
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Avg Score</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {metrics?.averageScore || 0}
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Weekly Activity Chart */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Activity Trends
          </h3>
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => setTrendRange('7')}
                className={`px-2 py-1 rounded ${trendRange === '7' ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                7d
              </button>
              <button
                onClick={() => setTrendRange('30')}
                className={`px-2 py-1 rounded ${trendRange === '30' ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              >
                30d
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {(trendRange === '7' ? metrics?.activity7 : metrics?.activity30)?.map((row, index) => (
              <div key={row.label + index} className="flex items-center space-x-3">
                <div className="w-12 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {row.label}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4">
                  <motion.div
                    className="bg-teal-500 h-3 sm:h-4 rounded-full"
                    initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, (row.count / Math.max(...(((trendRange === '7' ? metrics?.activity7 : metrics?.activity30) || []).map(d => d.count)), 1)) * 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.03 }}
                  />
                </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg score: {row.avgScore}</div>
                </div>
                <div className="w-8 text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-right">
                  {row.count}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Score Distribution Chart */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Score Distribution
          </h3>
          <div className="space-y-3">
            {metrics?.scoreDistribution.map((range, index) => (
              <div key={range.range} className="flex items-center space-x-3">
                <div className="w-16 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {range.range}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4">
                  <motion.div
                    className={`h-3 sm:h-4 rounded-full ${
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-orange-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(5, (range.count / Math.max(...(metrics?.scoreDistribution.map(r => r.count) || [1]))) * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                  />
                </div>
                <div className="w-8 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {range.count}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Time of Day & Needs Usage */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Time of Day</h3>
          <div className="space-y-3 mb-6">
            {metrics && [
              { label: 'Morning', value: metrics.timeOfDay?.morning || 0, color: 'bg-yellow-500' },
              { label: 'Afternoon', value: metrics.timeOfDay?.afternoon || 0, color: 'bg-blue-500' },
              { label: 'Evening', value: metrics.timeOfDay?.evening || 0, color: 'bg-indigo-500' },
            ].map((row, idx, rows) => (
              <div key={row.label} className="flex items-center space-x-3">
                <div className="w-20 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{row.label}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4">
                  <motion.div
                    className={`${row.color} h-3 sm:h-4 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(5, (row.value / Math.max(...rows.map(a => a.value), 1)) * 100)}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                  />
                </div>
                <div className="w-10 text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-right">{row.value}</div>
              </div>
            ))}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Needs Usage</h3>
          <div className="space-y-3">
            {metrics?.needsUsage?.map((row, idx) => (
              <div key={row.label} className="flex items-center space-x-3">
                <div className="w-28 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{row.label}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4">
                  <motion.div
                    className="bg-teal-500 h-3 sm:h-4 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.percent}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                  />
                </div>
                <div className="w-14 text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-right">{row.percent}%</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Evolution & Leaderboard */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Evolution</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedCompanyForTrend}
                onChange={(e) => setSelectedCompanyForTrend(e.target.value)}
                className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-1"
              >
                <option value="Global">Global</option>
                {companies.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="flex items-center space-x-2 text-sm">
                <button onClick={() => setTrendRange('7')} className={`px-2 py-1 rounded ${trendRange === '7' ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>7d</button>
                <button onClick={() => setTrendRange('30')} className={`px-2 py-1 rounded ${trendRange === '30' ? 'bg-teal-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>30d</button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {(
              selectedCompanyForTrend === 'Global'
                ? (trendRange === '7' ? metrics?.evolution7 : metrics?.evolution30)
                : (metrics?.companyScoreEvolution?.find(c => c.company === selectedCompanyForTrend)?.[
                    trendRange === '7' ? 'evolution7' : 'evolution30'
                  ])
            )?.map((row: any, idx: number) => (
              <div key={row.label + idx}>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{row.label}</span>
                  <span>Score {row.score}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded h-2"><div className="bg-emerald-500 h-2 rounded" style={{ width: `${Math.min(100, (row.calm ?? 0) * 10)}%` }} /></div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded h-2"><div className="bg-indigo-500 h-2 rounded" style={{ width: `${Math.min(100, (row.clarity ?? 0) * 10)}%` }} /></div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded h-2"><div className="bg-amber-500 h-2 rounded" style={{ width: `${Math.min(100, (row.energy ?? 0) * 10)}%` }} /></div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Company Leaderboard</h3>
          <div className="space-y-2">
            {metrics?.leaderboard?.map((row, idx) => (
              <div key={row.company} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-5 text-right">{idx + 1}.</span>
                  <span className="font-medium text-gray-900 dark:text-white">{row.company}</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">{row.totalSessions} sessions</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderFeedbackTab = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          User Feedback
        </h2>
        <button
          onClick={exportFeedback}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="text-center py-8 sm:py-12">
          <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
            Feedback Collection Coming Soon
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            User feedback collection and management features will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );

  // Export company metrics as CSV
  // kept intentionally empty; moved above as function declaration to satisfy hoisting
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button
                onClick={signOut}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm sm:text-base"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Mobile Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center space-x-2 py-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {isMobileMenuOpen ? (
                <>
                  <CloseIcon className="w-5 h-5" />
                  <span>Close Menu</span>
                </>
              ) : (
                <>
                  <Menu className="w-5 h-5" />
                  <span>Menu</span>
                </>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {[
              { id: 'users', label: 'Users & Profiles', icon: Users },
              { id: 'companies', label: 'Companies', icon: Building2 },
              { id: 'usage', label: 'Usage & Impact', icon: BarChart3 },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.nav
                className="lg:hidden border-t border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="py-2 space-y-1">
                  {[
                    { id: 'users', label: 'Users & Profiles', icon: Users },
                    { id: 'companies', label: 'Companies', icon: Building2 },
                    { id: 'usage', label: 'Usage & Impact', icon: BarChart3 },
                    { id: 'feedback', label: 'Feedback', icon: MessageSquare }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'companies' && renderCompaniesTab()}
            {activeTab === 'usage' && renderUsageTab()}
            {activeTab === 'feedback' && renderFeedbackTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* User Detail Modal - Mobile Responsive */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  User Details
                </h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Profile Info */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold self-center sm:self-auto">
                    {selectedUser.full_name?.charAt(0)?.toUpperCase() || selectedUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedUser.full_name || 'No name set'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Joined {format(new Date(selectedUser.created_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-teal-600">
                      {selectedUser.globalScore}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Global Score</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      {selectedUser.sessionCount}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sessions</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {selectedUser.badges.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Badges</div>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Role selection removed */}
                    <div className="flex items-center gap-2">
                      {!selectedUser.is_active ? (
                        <button
                          onClick={async () => {
                            try {
                              await (supabase as any).from('profiles').update({ is_active: true }).eq('id', selectedUser.id);
                              setSelectedUser({ ...selectedUser, is_active: true } as any);
                              await loadAdminData();
                            } catch (e) {
                              console.error(e);
                              alert('Failed to reactivate');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await (supabase as any).from('profiles').update({ is_active: false }).eq('id', selectedUser.id);
                              setSelectedUser({ ...selectedUser, is_active: false } as any);
                              await loadAdminData();
                            } catch (e) {
                              console.error(e);
                              alert('Failed to deactivate');
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Earned Badges
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                      >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {badge}
                      </span>
                    ))}
                    {selectedUser.badges.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 italic">No badges earned yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Users Modal */}
      <AnimatePresence>
        {isInviteOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsInviteOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Users</h3>
                <button onClick={() => setIsInviteOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Emails (comma-separated)</label>
                  <textarea
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-3 py-2 text-sm"
                    rows={3}
                    placeholder="jane@acme.com, john@acme.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Company domain (optional)</label>
                  <input
                    value={inviteCompanyDomain}
                    onChange={(e) => setInviteCompanyDomain(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-3 py-2 text-sm"
                    placeholder="acme.com"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button onClick={() => setIsInviteOpen(false)} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded">Cancel</button>
                  <button
                    onClick={async () => {
                      try {
                        const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
                        if (emails.length === 0) {
                          alert('Please enter at least one email');
                          return;
                        }
                        const url = `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/send-invite`;
                        const res = await fetch(url, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ emails, companyDomain: inviteCompanyDomain || null })
                        });
                        if (!res.ok) throw new Error(await res.text());
                        alert('Invites sent');
                        setIsInviteOpen(false);
                        setInviteEmails('');
                        setInviteCompanyDomain('');
                      } catch (e) {
                        console.error(e);
                        // Fallback: copy signup URL to clipboard for manual sending
                        const signupUrl = window.location.origin + '/signup';
                        await navigator.clipboard.writeText(`${signupUrl}?emails=${encodeURIComponent(inviteEmails)}`);
                        alert('Could not call invite service. Signup link copied to clipboard.');
                      }
                    }}
                    className="px-3 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded"
                  >
                    Send Invites
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}