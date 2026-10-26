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
  LogIn,
  Menu,
  X,
  PlusCircle,
  ListOrdered,
  Users,
  Settings,
  Sparkles,
} from 'lucide-react';
import { DataService } from '@/services/dataService';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      show: user?.role === 'driver',
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
    { name: 'My Charger Listings', path: '/owner/chargers', icon: Zap },
    { name: 'Add New Charger', path: '/owner/chargers/new', icon: PlusCircle },
    { name: 'Incoming Requests', path: '/owner/requests', icon: ListOrdered },
  ];

  const superadminSidebarLinks = [
    { name: 'Platform Metrics', path: '/superadmin', icon: LayoutDashboard },
    { name: 'Platform Users', path: '/superadmin/users', icon: Users },
    { name: 'Charger Moderation', path: '/superadmin/chargers', icon: Zap },
    { name: 'Request Oversight', path: '/superadmin/requests', icon: ListOrdered },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F4] text-[#17231F]">
      {/* 1. Quick Demo Switcher Bar */}
      <div className="bg-[#174D3A] text-white py-1.5 px-4 text-xs font-medium border-b border-[#123D2E] flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C8F169] text-[#17231F] font-bold text-[11px]">
            <Sparkles className="w-3 h-3 fill-current" />
            DEMO MODE
          </span>
          <span className="text-gray-300 hidden sm:inline">Active Persona:</span>
          <span className="font-bold text-[#C8F169] flex items-center gap-1">
            {user?.display_name || 'Guest'} ({user?.role?.toUpperCase() || 'NONE'})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-300 text-[11px] hidden md:inline">Switch Role:</span>
          <button
            onClick={() => {
              switchDemoRole('driver');
              navigate('/chargers');
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              user?.role === 'driver'
                ? 'bg-[#C8F169] text-[#17231F] shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Driver (Rahul)
          </button>
          <button
            onClick={() => {
              switchDemoRole('admin');
              navigate('/owner');
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              user?.role === 'admin'
                ? 'bg-[#C8F169] text-[#17231F] shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Host (Kiran)
          </button>
          <button
            onClick={() => {
              switchDemoRole('superadmin');
              navigate('/superadmin');
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
              user?.role === 'superadmin'
                ? 'bg-[#C8F169] text-[#17231F] shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Superadmin (Ananya)
          </button>

          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reset demo data to initial clean seed"
            className="ml-2 text-[10px] text-gray-400 hover:text-white underline"
          >
            {resetting ? 'Resetting...' : 'Reset Demo'}
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#174D3A] text-[#C8F169] flex items-center justify-center font-extrabold shadow-sm transition group-hover:scale-105">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#17231F]">Volt</span>
              <span className="text-xl font-extrabold text-[#174D3A]">Spot</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks
              .filter(link => link.show)
              .map(link => {
                const Icon = link.icon;
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                      active
                        ? 'bg-[#EAF3EF] text-[#174D3A]'
                        : 'text-[#66736D] hover:text-[#17231F] hover:bg-gray-50'
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
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-[#17231F]">{user.display_name}</div>
                  <div className="text-[10px] font-medium text-[#66736D] uppercase tracking-wider">
                    {user.role === 'admin' ? 'Charger Host' : user.role}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-xl border border-border text-[#66736D] hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#17231F] hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#174D3A] text-white hover:bg-[#123D2E] transition shadow-xs"
                >
                  Join VoltSpot
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-border text-[#17231F]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-2">
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
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                      active
                        ? 'bg-[#EAF3EF] text-[#174D3A]'
                        : 'text-[#66736D] hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

            <div className="pt-3 border-t border-border flex items-center justify-between">
              {user ? (
                <>
                  <div>
                    <div className="text-sm font-bold text-[#17231F]">{user.display_name}</div>
                    <div className="text-xs text-[#66736D] capitalize">{user.role}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="w-full flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-sm font-semibold border border-border rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-sm font-semibold bg-[#174D3A] text-white rounded-xl"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. Main Workspace with Optional Sidebar for Owner / Superadmin */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isOwnerRoute || isSuperadminRoute ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Sidebar for Owner / Superadmin */}
            <aside className="md:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-border p-4 shadow-subtle">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#66736D]">
                  {isOwnerRoute ? 'Host Management' : 'Platform Administration'}
                </div>
                <nav className="space-y-1 mt-2">
                  {(isOwnerRoute ? ownerSidebarLinks : superadminSidebarLinks).map(item => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                          active
                            ? 'bg-[#EAF3EF] text-[#174D3A] border-l-4 border-[#C8F169]'
                            : 'text-[#66736D] hover:bg-gray-50 hover:text-[#17231F]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Host Quick Tip Card */}
              {isOwnerRoute && (
                <div className="bg-[#174D3A] text-white rounded-2xl p-4 shadow-sm text-xs space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-[#C8F169]">
                    <Zap className="w-4 h-4 fill-current" />
                    Host Tip
                  </div>
                  <p className="text-gray-200 leading-relaxed">
                    Approve incoming driver requests promptly to increase your station's reliability score.
                  </p>
                </div>
              )}
            </aside>

            {/* Content Area */}
            <main className="md:col-span-9">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </div>

      {/* 4. Footer */}
      <footer className="mt-auto border-t border-border bg-white text-xs text-[#66736D] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#17231F]">VoltSpot</span>
            <span>•</span>
            <span>Find a plug. Request a slot. Get moving.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Secure RLS Enabled
            </span>
            <span>PostgreSQL Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
