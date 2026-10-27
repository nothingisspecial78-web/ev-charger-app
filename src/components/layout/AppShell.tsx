import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  Zap,
  MapPin,
  CalendarCheck2,
  LayoutDashboard,
  Shield,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ListOrdered,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { DataService } from '@/services/dataService';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const isOwnerRoute = location.pathname.startsWith('/owner');
  const isSuperadminRoute = location.pathname.startsWith('/superadmin');

  const handleResetData = () => {
    setResetting(true);
    DataService.resetDemoData();
    setTimeout(() => {
      setResetting(false);
      window.location.reload();
    }, 400);
  };

  const navLinks = [
    { name: 'Discover Chargers', path: '/chargers', icon: MapPin, show: true },
    {
      name: 'My Booking Requests',
      path: '/my-requests',
      icon: CalendarCheck2,
      show: user?.role === 'driver' || user?.role === 'admin' || user?.role === 'superadmin',
    },
    {
      name: 'Host Dashboard',
      path: '/owner',
      icon: LayoutDashboard,
      show: user?.role === 'admin' || user?.role === 'superadmin',
    },
    {
      name: 'Superadmin Oversight',
      path: '/superadmin',
      icon: Shield,
      show: user?.role === 'superadmin',
    },
  ];

  const ownerSidebarLinks = [
    { name: 'Host Overview', path: '/owner', icon: LayoutDashboard },
    { name: 'My Chargers', path: '/owner/chargers', icon: Zap },
    { name: 'Add Charger', path: '/owner/chargers/new', icon: PlusCircle },
    { name: 'Incoming Requests', path: '/owner/requests', icon: ListOrdered },
  ];

  const superadminSidebarLinks = [
    { name: 'Platform Metrics', path: '/superadmin', icon: LayoutDashboard },
    { name: 'Users Directory', path: '/superadmin/users', icon: Users },
    { name: 'Charger Moderation', path: '/superadmin/chargers', icon: Zap },
    { name: 'Requests Oversight', path: '/superadmin/requests', icon: ListOrdered },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] text-[#17231F] w-full overflow-x-hidden selection:bg-[#C8F169] selection:text-[#17231F]">
      {/* Top Demo Banner for fast evaluator role toggling */}
      <div className="bg-[#174D3A] text-white text-xs px-3 sm:px-6 py-1.5 flex items-center justify-between border-b border-[#123D2E] z-50">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8F169] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8F169]"></span>
          </span>
          <span className="font-semibold truncate">VoltSpot MVP Demo System</span>
          <span className="hidden sm:inline text-gray-300">• Switch roles instantly:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => switchDemoRole('driver')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              user?.role === 'driver'
                ? 'bg-[#C8F169] text-[#17231F] shadow-xs'
                : 'bg-white/10 text-gray-200 hover:bg-white/20'
            }`}
          >
            🚗 Driver
          </button>
          <button
            onClick={() => switchDemoRole('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              user?.role === 'admin'
                ? 'bg-[#C8F169] text-[#17231F] shadow-xs'
                : 'bg-white/10 text-gray-200 hover:bg-white/20'
            }`}
          >
            ⚡ Host (Kiran)
          </button>
          <button
            onClick={() => switchDemoRole('superadmin')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              user?.role === 'superadmin'
                ? 'bg-[#C8F169] text-[#17231F] shadow-xs'
                : 'bg-white/10 text-gray-200 hover:bg-white/20'
            }`}
          >
            🛡️ Admin
          </button>
          <button
            onClick={handleResetData}
            disabled={resetting}
            className="hidden md:inline-block ml-2 text-[10px] text-gray-300 hover:text-white underline"
            title="Reset sample demo data"
          >
            {resetting ? 'Resetting...' : 'Reset Data'}
          </button>
        </div>
      </div>

      {/* Top Navigation Bar - Glassmorphism Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#174D3A] to-[#1F6B50] text-[#C8F169] flex items-center justify-center font-extrabold shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(200,241,105,0.4)]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-extrabold tracking-tight text-[#17231F]">Volt</span>
                <span className="text-xl font-extrabold text-[#174D3A]">Spot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-2"></span>
              </div>
              <div className="text-[10px] text-[#66736D] -mt-1 font-semibold tracking-wider uppercase hidden sm:block">
                EV Charging Network
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks
              .filter(link => link.show)
              .map(link => {
                const Icon = link.icon;
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      active
                        ? 'bg-[#EAF3EF] text-[#174D3A] shadow-xs'
                        : 'text-[#66736D] hover:text-[#17231F] hover:bg-gray-100/70'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
          </nav>

          {/* Right Actions / Auth Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-[#F5F7F4] pl-3 pr-1.5 py-1.5 rounded-2xl border border-border">
                <div className="text-right">
                  <div className="text-xs font-extrabold text-[#17231F] leading-tight">
                    {user.display_name}
                  </div>
                  <div className="text-[10px] font-bold text-[#174D3A] uppercase tracking-wider">
                    {user.role === 'admin'
                      ? 'Charger Host'
                      : user.role === 'superadmin'
                      ? 'Superadmin'
                      : 'Driver'}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-xl text-[#66736D] hover:text-rose-600 hover:bg-rose-50 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-[#17231F] hover:bg-gray-100 transition min-h-[40px] flex items-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-[#174D3A] hover:bg-[#123D2E] text-white transition shadow-sm hover:shadow-card min-h-[40px] flex items-center gap-1.5"
                >
                  <span>Join VoltSpot</span>
                  <ChevronRight className="w-4 h-4 text-[#C8F169]" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-border text-[#17231F] min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu with full touch accessibility */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            {navLinks
              .filter(link => link.show)
              .map(link => {
                const Icon = link.icon;
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold min-h-[48px] ${
                      active
                        ? 'bg-[#EAF3EF] text-[#174D3A]'
                        : 'text-[#66736D] hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-[#174D3A]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

            <div className="pt-3 border-t border-border flex items-center justify-between">
              {user ? (
                <>
                  <div className="min-w-0 pr-2">
                    <div className="text-sm font-bold text-[#17231F] truncate">{user.display_name}</div>
                    <div className="text-xs text-[#174D3A] font-semibold uppercase">{user.role}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl min-h-[40px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="w-full flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-3 text-center text-sm font-bold border border-border rounded-xl min-h-[44px] flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-3 text-center text-sm font-bold bg-[#174D3A] text-white rounded-xl min-h-[44px] flex items-center justify-center"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {isOwnerRoute || isSuperadminRoute ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8">
            {/* Top/Sidebar Nav for Owner / Superadmin */}
            <aside className="md:col-span-3 space-y-4">
              <div className="bg-white rounded-3xl border border-border p-4 sm:p-5 shadow-card">
                <div className="px-2 py-1 text-xs font-extrabold uppercase tracking-wider text-[#174D3A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isOwnerRoute ? 'Host Management' : 'Superadmin Tools'}</span>
                </div>

                {/* Horizontal scroll on mobile (<768px), vertical sidebar on desktop */}
                <nav className="flex md:flex-col gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                  {(isOwnerRoute ? ownerSidebarLinks : superadminSidebarLinks).map(item => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap min-h-[42px] ${
                          active
                            ? 'bg-[#EAF3EF] text-[#174D3A] md:border-l-4 md:border-[#C8F169] shadow-2xs'
                            : 'text-[#66736D] hover:bg-gray-50 hover:text-[#17231F]'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {isOwnerRoute && (
                <div className="hidden md:block bg-gradient-to-br from-[#174D3A] to-[#123D2E] text-white rounded-3xl p-5 shadow-card text-xs space-y-2.5 border border-[#174D3A]">
                  <div className="font-extrabold flex items-center gap-1.5 text-[#C8F169] text-sm">
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Host Pro Tip</span>
                  </div>
                  <p className="text-gray-200 leading-relaxed text-xs">
                    Confirm incoming driver booking requests promptly to improve your station's reliability score and attract more repeat drivers.
                  </p>
                </div>
              )}
            </aside>

            {/* Content Area */}
            <main className="md:col-span-9 min-w-0">{children}</main>
          </div>
        ) : (
          <main className="min-w-0">{children}</main>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (App Experience) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border px-2 py-1 flex items-center justify-around shadow-lg">
        <Link
          to="/chargers"
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-bold min-h-[44px] ${
            location.pathname === '/chargers' ? 'text-[#174D3A]' : 'text-[#66736D]'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span>Discover</span>
        </Link>
        <Link
          to="/my-requests"
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-bold min-h-[44px] ${
            location.pathname === '/my-requests' ? 'text-[#174D3A]' : 'text-[#66736D]'
          }`}
        >
          <CalendarCheck2 className="w-5 h-5 mb-0.5" />
          <span>Requests</span>
        </Link>
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <Link
            to="/owner"
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-bold min-h-[44px] ${
              location.pathname.startsWith('/owner') ? 'text-[#174D3A]' : 'text-[#66736D]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Host Hub</span>
          </Link>
        )}
        <Link
          to={user ? '/my-requests' : '/login'}
          className="flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-bold min-h-[44px] text-[#66736D]"
        >
          <Zap className="w-5 h-5 mb-0.5 text-[#174D3A]" />
          <span>{user ? 'Account' : 'Sign In'}</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-white text-xs text-[#66736D] py-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="font-extrabold text-[#17231F] text-sm">VoltSpot</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs">Find a plug. Request a slot. Get moving.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              PostgreSQL Row-Level Security
            </span>
            <span className="font-medium">OpenStreetMap & Leaflet Geocoding</span>
            <span className="text-gray-400">VoltSpot MVP v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
