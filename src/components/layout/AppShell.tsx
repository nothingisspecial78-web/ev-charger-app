import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import {
  Zap, MapPin, CalendarCheck2, LayoutDashboard, Shield, LogOut, Menu, X,
  PlusCircle, ListOrdered, Users, ChevronDown, UserCircle,
} from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isOwnerRoute = location.pathname.startsWith('/owner');
  const isSuperadminRoute = location.pathname.startsWith('/superadmin');
  const navLinks = [
    { name: 'Discover', path: '/chargers', icon: MapPin, show: true },
    { name: 'My requests', path: '/my-requests', icon: CalendarCheck2, show: Boolean(user) },
    { name: 'Host dashboard', path: '/owner', icon: LayoutDashboard, show: user?.role === 'admin' || user?.role === 'superadmin' },
    { name: 'Administration', path: '/superadmin', icon: Shield, show: user?.role === 'superadmin' },
  ];
  const ownerLinks = [
    { name: 'Overview', path: '/owner', icon: LayoutDashboard },
    { name: 'My chargers', path: '/owner/chargers', icon: Zap },
    { name: 'Add charger', path: '/owner/chargers/new', icon: PlusCircle },
    { name: 'Requests', path: '/owner/requests', icon: ListOrdered },
  ];
  const adminLinks = [
    { name: 'Overview', path: '/superadmin', icon: LayoutDashboard },
    { name: 'Users', path: '/superadmin/users', icon: Users },
    { name: 'Chargers', path: '/superadmin/chargers', icon: Zap },
    { name: 'Requests', path: '/superadmin/requests', icon: ListOrdered },
  ];
  const roleLabel = user?.role === 'admin' ? 'Host' : user?.role === 'superadmin' ? 'Superadmin' : 'Driver';
  const initials = user?.display_name?.slice(0, 1).toUpperCase() || 'U';

  const signOut = async () => { await logout(); setProfileOpen(false); setMobileMenuOpen(false); };
  const profilePanel = user && (
    <div className="absolute right-0 top-12 z-50 w-56 rounded-control border border-border bg-surface p-2 shadow-lg">
      <div className="border-b border-border px-3 py-2"><p className="truncate text-sm font-semibold text-foreground">{user.display_name}</p><p className="text-xs text-muted">{roleLabel}</p></div>
      <button type="button" onClick={signOut} className="mt-1 flex min-h-[40px] w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-danger hover:bg-danger-bg"><LogOut className="h-4 w-4" /> Sign out</button>
    </div>
  );

  return (
    <ToastProvider>
      <div className="flex min-h-screen w-full flex-col bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-surface">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2.5" aria-label="VoltSpot home">
              <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary text-accent"><Zap className="h-5 w-5 fill-current" /></span>
              <span className="text-xl font-bold tracking-tight">Volt<span className="text-primary">Spot</span></span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
              {navLinks.filter(link => link.show).map(link => { const Icon = link.icon; const active = location.pathname === link.path || (link.path !== '/chargers' && location.pathname.startsWith(link.path)); return <Link key={link.path} to={link.path} aria-current={active ? 'page' : undefined} className={`flex min-h-[40px] items-center gap-2 rounded-control px-3 text-sm font-semibold transition-colors ${active ? 'bg-primary-50 text-primary' : 'text-muted hover:bg-surface-muted hover:text-foreground'}`}><Icon className="h-4 w-4" />{link.name}</Link>; })}
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              {user ? <div className="relative"><button type="button" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} className="flex min-h-[44px] items-center gap-2 rounded-control border border-border px-2.5 hover:bg-surface-muted"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">{initials}</span><span className="max-w-[120px] truncate text-sm font-semibold">{user.display_name}</span><ChevronDown className="h-4 w-4 text-muted" /></button>{profileOpen && profilePanel}</div> : <><Link to="/login" className="flex min-h-[44px] items-center px-3 text-sm font-semibold text-muted hover:text-foreground">Sign in</Link><Link to="/signup" className="flex min-h-[44px] items-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Create account</Link></>}
            </div>
            <button type="button" onClick={() => setMobileMenuOpen(value => !value)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-control border border-border md:hidden">{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
          {mobileMenuOpen && <div className="border-t border-border bg-surface px-4 py-3 md:hidden"><nav className="space-y-1">{navLinks.filter(link => link.show).map(link => { const Icon = link.icon; const active = location.pathname === link.path; return <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} aria-current={active ? 'page' : undefined} className={`flex min-h-[44px] items-center gap-3 rounded-control px-3 text-sm font-semibold ${active ? 'bg-primary-50 text-primary' : 'text-muted'}`}><Icon className="h-5 w-5" />{link.name}</Link>; })}</nav>{user ? <button type="button" onClick={signOut} className="mt-3 flex min-h-[44px] w-full items-center gap-2 border-t border-border pt-3 text-sm font-semibold text-danger"><LogOut className="h-4 w-4" />Sign out</button> : <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mt-3 flex min-h-[44px] items-center border-t border-border pt-3 text-sm font-semibold text-primary">Sign in</Link>}</div>}
        </header>

        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-8 lg:px-8">
          {isOwnerRoute || isSuperadminRoute ? <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_minmax(0,1fr)]"><aside className="self-start md:sticky md:top-24"><div className="rounded-card border border-border bg-surface p-2"><p className="px-3 py-2 text-xs font-semibold text-muted">{isOwnerRoute ? 'Host workspace' : 'Platform administration'}</p><nav className="flex gap-1 overflow-x-auto no-scrollbar md:flex-col">{(isOwnerRoute ? ownerLinks : adminLinks).map(item => { const Icon = item.icon; const active = location.pathname === item.path; return <Link key={item.path} to={item.path} aria-current={active ? 'page' : undefined} className={`flex min-h-[42px] items-center gap-2 rounded-control border-l-[3px] px-3 text-sm font-semibold whitespace-nowrap ${active ? 'border-accent bg-primary-50 text-primary' : 'border-transparent text-muted hover:bg-surface-muted hover:text-foreground'}`}><Icon className="h-4 w-4" />{item.name}</Link>; })}</nav></div>{isOwnerRoute && <p className="mt-3 hidden rounded-card bg-primary-50 p-3 text-xs leading-5 text-primary md:block">Keep listing details current so drivers can make informed requests.</p>}</aside><main className="min-w-0">{children}</main></div> : <main className="min-w-0">{children}</main>}
        </div>

        {user && <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-surface px-2 py-1 md:hidden"><Link to="/chargers" aria-current={location.pathname === '/chargers' ? 'page' : undefined} className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-3 text-xs font-semibold ${location.pathname === '/chargers' ? 'text-primary' : 'text-muted'}`}><MapPin className="h-5 w-5" />Discover</Link><Link to="/my-requests" aria-current={location.pathname === '/my-requests' ? 'page' : undefined} className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-3 text-xs font-semibold ${location.pathname === '/my-requests' ? 'text-primary' : 'text-muted'}`}><CalendarCheck2 className="h-5 w-5" />Requests</Link><button type="button" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} className="flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-3 text-xs font-semibold text-muted"><UserCircle className="h-5 w-5" />Account</button></div>}
        {user && profileOpen && <div className="fixed inset-x-4 bottom-20 z-50 rounded-card border border-border bg-surface p-4 shadow-lg md:hidden"><p className="font-semibold">{user.display_name}</p><p className="text-sm text-muted">{roleLabel}</p><button type="button" onClick={signOut} className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-control bg-danger-bg text-sm font-semibold text-danger"><LogOut className="h-4 w-4" />Sign out</button></div>}
        <footer className="border-t border-border bg-surface py-6"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-center text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span className="font-semibold text-foreground">VoltSpot</span><span>Find a plug. Request a slot. Get moving.</span></div></footer>
      </div>
    </ToastProvider>
  );
};
