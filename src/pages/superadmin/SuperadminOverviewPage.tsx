import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/dataService';
import { SuperadminMetrics, BookingRequest, Charger } from '@/types';
import { MetricCard } from '@/components/common/MetricCard';
import { RequestStatusBadge, ChargerStatusBadge } from '@/components/common/Badges';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Zap,
  Clock,
  CheckCircle2,
  ListOrdered,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const SuperadminOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SuperadminMetrics | null>(null);
  const [recentRequests, setRecentRequests] = useState<BookingRequest[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        const [m, reqs, chs] = await Promise.all([
          DataService.getSuperadminMetrics(),
          DataService.getAllRequests(),
          DataService.getAllChargers(),
        ]);
        setMetrics(m);
        setRecentRequests(reqs.slice(0, 5));
        setChargers(chs.slice(0, 4));
      } catch (err) {
        console.error('Superadmin overview error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlatformData();
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4 text-primary" />
          <span>Platform Administration & Governance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          System Overview & Metrics
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 font-medium">
          Verified database aggregates, active station counts, and ecosystem oversight.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers ?? '-'}
          subtitle="Drivers & Hosts"
          icon={<Users className="w-5 h-5" />}
          accentColor="primary"
        />
        <MetricCard
          title="Active Listings"
          value={metrics?.activeListings ?? '-'}
          subtitle="Published stations"
          icon={<Zap className="w-5 h-5 fill-current" />}
          accentColor="lime"
        />
        <MetricCard
          title="Pending Requests"
          value={metrics?.pendingRequests ?? '-'}
          subtitle="In host review"
          icon={<Clock className="w-5 h-5" />}
          accentColor="amber"
        />
        <MetricCard
          title="Approved Sessions"
          value={metrics?.approvedRequests ?? '-'}
          subtitle={`Out of ${metrics?.totalRequests ?? 0} total`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Platform Requests */}
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3.5">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-primary" />
              <span>Recent Reservation Queries</span>
            </h2>
            <Link
              to="/superadmin/requests"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted animate-pulse">Loading platform queries...</div>
          ) : recentRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">No reservation requests recorded.</div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map(r => (
                <div
                  key={r.id}
                  className="bg-background rounded-2xl p-3.5 text-xs flex items-center justify-between gap-3 border border-border/70 hover:border-primary/30 transition"
                >
                  <div className="min-w-0">
                    <div className="font-extrabold text-foreground truncate">{r.charger?.name || 'Charging Bay'}</div>
                    <div className="text-[11px] text-muted mt-0.5 truncate">
                      Driver: {r.driver?.display_name || 'Anonymous'} • {r.duration_minutes}m slot
                    </div>
                  </div>
                  <RequestStatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Station Moderation Quick Look */}
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3.5">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Charging Stations</span>
            </h2>
            <Link
              to="/superadmin/chargers"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Moderate All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted animate-pulse">Loading stations...</div>
          ) : chargers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">No charging stations recorded.</div>
          ) : (
            <div className="space-y-3">
              {chargers.map(c => (
                <div
                  key={c.id}
                  className="bg-background rounded-2xl p-3.5 text-xs flex items-center justify-between gap-3 border border-border/70 hover:border-primary/30 transition"
                >
                  <div className="min-w-0">
                    <div className="font-extrabold text-foreground truncate">{c.name}</div>
                    <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{c.area || c.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Disabled'}
                    </span>
                    <ChargerStatusBadge status={c.availability_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
