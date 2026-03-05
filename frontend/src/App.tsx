import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import History from './pages/History';
import PatientRegistration from './pages/PatientRegistration';
import PatientSearch from './pages/PatientSearch';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { Icons } from './constants';
import clsx from 'clsx';
import { User, UserRole } from './types';
import { DataProvider } from './contexts/DataContext';

function App() {
  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { loginUser } = await import('./services/authService');
      const authenticatedUser: any = await loginUser(email, password);

      const newUser: User = {
        id: authenticatedUser.email,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: authenticatedUser.role as UserRole,
        organization: authenticatedUser.organization
      };

      console.log('🔐 Login successful:', newUser.email);
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));

      // Save login history
      const loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
      loginHistory.push({
        email: newUser.email,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString()
      });
      localStorage.setItem('loginHistory', JSON.stringify(loginHistory));

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    role: string,
    organization: string,
    department: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { registerUser } = await import('./services/authService');
      await registerUser(email, password, name, role, organization, department);

      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Registration failed. Please try again.' };
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Redirect to landing page
    window.location.href = '/';
  };

  return (
    <DataProvider userId={user?.email} key={user?.email || 'no-user'}> {/* Key forces remount when user changes */}
      <BrowserRouter>
        <AppRoutes
          user={user}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onLogout={handleLogout}
        />
      </BrowserRouter>
    </DataProvider>
  );
}

interface AppRoutesProps {
  user: User | null;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignup: (
    name: string,
    email: string,
    password: string,
    role: string,
    organization: string,
    department: string
  ) => Promise<{ success: boolean; error?: string }>;
  onLogout: () => void;
}

function AppRoutes({ user, onLogin, onSignup, onLogout }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <LandingPage onStart={() => window.location.href = '/login'} onLogin={() => window.location.href = '/login'} />
      } />
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={onLogin} onSignup={() => window.location.href = '/signup'} />
      } />
      <Route path="/signup" element={
        user ? <Navigate to="/dashboard" replace /> : <SignupPage onSignup={onSignup} onLogin={() => window.location.href = '/login'} />
      } />
      <Route path="/reset-password" element={
        user ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />
      } />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={
        user ? <DashboardLayout user={user} onLogout={onLogout} /> : <Navigate to="/login" replace />
      }>
        <Route index element={<Dashboard userName={user?.name} />} />
        <Route path="analyze" element={<NewAnalysis />} />
        <Route path="history" element={<History />} />
        <Route path="register" element={<PatientRegistration />} />
        <Route path="search" element={<PatientSearch />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: Icons.Dashboard },
    { label: 'New Analysis', path: '/dashboard/analyze', icon: Icons.Microscope },
    { label: 'Patient History', path: '/dashboard/history', icon: Icons.Reports },
    { label: 'Register Patient', path: '/dashboard/register', icon: Icons.Profile },
    { label: 'Patient Search', path: '/dashboard/search', icon: Icons.Search },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header - only on small screens */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-900/50">O</div>
          <h1 className="font-bold text-sm tracking-wide">BreastCancerAI</h1>
        </div>
        <button onClick={toggleSidebar} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          {isSidebarOpen ? <Icons.X size={24} /> : <Icons.Dashboard size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: fixed on both desktop and mobile, but always visible on desktop */}
      <aside className={clsx(
        "fixed top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300",
        "md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/50">O</div>
            <div>
              <h1 className="font-bold text-lg tracking-wide">BreastCancerAI</h1>
              <p className="text-xs text-slate-400 font-medium">Clinical AI Assistant</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-4">Platform</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors font-medium text-sm"
          >
            <Icons.X size={20} />
            Sign Out
          </button>

          <div className="mt-4 flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-blue-100 font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.organization || 'Clinical'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content: pushed right by sidebar width on desktop */}
      <main className="md:ml-72 p-4 md:p-8 min-h-screen fade-in">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;
