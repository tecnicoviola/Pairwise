import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PairwiseLogo } from './PairwiseLogo';
import { ThemeToggle } from './ThemeToggle';
import {
  Users,
  Sparkles,
  Heart,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Assigned Clients', path: '/dashboard', icon: Users },
    { label: 'Philosophy & Rules', path: '/philosophy', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-pw-ivory flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="w-full md:w-64 bg-white border-r border-pw-border flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen z-30">
        <div>
          {/* Logo Branding */}
          <div className="p-6 border-b border-pw-border">
            <div className="flex items-center justify-between gap-2">
              <Link to="/dashboard">
                <PairwiseLogo size="md" variant="full" />
              </Link>
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-pw-muted px-3 py-2">
              Workspace Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-pw-plum text-white shadow-sm'
                      : 'text-pw-text hover:bg-pw-ivory hover:text-pw-plum'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-pw-rose' : 'text-pw-muted'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </Link>
              );
            })}
          </nav>

          {/* Quick Engine Status Card */}
          <div className="px-4 py-2">
            <div className="p-3.5 rounded-2xl bg-pw-ivory border border-pw-border">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-pw-rose" />
                <span className="text-[11px] font-bold text-pw-plum">5-Stage Engine Active</span>
              </div>
              <p className="text-[10px] text-pw-muted leading-relaxed">
                Deterministic geometric scoring & grounded AI introductions enabled.
              </p>
            </div>
          </div>
        </div>

        {/* Matchmaker Profile & Signout Footer */}
        {user && (
          <div className="p-4 border-t border-pw-border bg-pw-ivory/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-pw-burgundy text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-pw-text truncate">{user.name}</p>
                  <p className="text-[10px] text-pw-muted truncate">Matchmaker</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-pw-muted hover:text-rose-700 hover:bg-rose-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="md:hidden bg-white border-b border-pw-border px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <Link to="/dashboard">
            <PairwiseLogo size="sm" variant="minimal" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-pw-plum hover:underline"
            >
              Clients
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-pw-muted hover:text-rose-600 font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
