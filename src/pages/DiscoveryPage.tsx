import React, { useState, useEffect } from 'react';
import { Charger, ChargerFilters, ConnectorType, AvailabilityStatus } from '@/types';
import { DataService } from '@/services/dataService';
import { ChargerCard } from '@/components/common/ChargerCard';
import { ChargerMap } from '@/components/common/ChargerMap';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/common/Feedback';
import { calculateDistanceKm } from '@/utils/geo';
import {
  Search,
  Map,
  List,
  X,
  Zap,
  RotateCcw,
  Navigation,
  Crosshair,
  SlidersHorizontal,
} from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User GPS Location
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // Filters state
  const [query, setQuery] = useState('');
  const [connector, setConnector] = useState<ConnectorType | 'all'>('all');
  const [minPower, setMinPower] = useState<number | 'all'>('all');
  const [status, setStatus] = useState<AvailabilityStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'nearest' | 'power_desc' | 'power_asc' | 'price_asc' | 'name_asc'>('nearest');

  // UI state
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Request browser location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
      },
      err => {
        console.warn('Geolocation access denied or unavailable:', err);
        // Default to Kozhikode Central coordinate as a realistic fallback
        setUserCoords({ latitude: 11.2588, longitude: 75.7804 });
        setLocationDenied(true);
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const fetchChargers = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: ChargerFilters = {
        query: query.trim() || undefined,
        connector,
        minPower,
        status,
        sortBy,
      };
      const data = await DataService.getPublishedChargers(filters);

      // Attach distance if userCoords available
      let enriched = data.map(c => {
        if (userCoords && c.latitude && c.longitude) {
          const dist = calculateDistanceKm(userCoords.latitude, userCoords.longitude, c.latitude, c.longitude);
          return { ...c, distanceKm: dist };
        }
        return c;
      });

      // Sort by nearest if selected
      if (sortBy === 'nearest' && userCoords) {
        enriched.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }

      setChargers(enriched);
    } catch (err: any) {
      setError(err?.message || 'Failed to load chargers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargers();
  }, [connector, minPower, status, sortBy, userCoords]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChargers();
  };

  const clearAllFilters = () => {
    setQuery('');
    setConnector('all');
    setMinPower('all');
    setStatus('all');
    setSortBy('nearest');
  };

  const hasActiveFilters =
    Boolean(query) || connector !== 'all' || minPower !== 'all' || status !== 'all';

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 w-full max-w-full overflow-hidden">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#174D3A] uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 fill-current" />
            <span>Driver Discovery Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            Find your next charge
          </h1>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1">
            Showing chargers closest to your location. Review specs and request a session.
          </p>
        </div>

        {/* View Mode Toggle & GPS Refresh */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={detectLocation}
            disabled={locating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-border text-[#174D3A] hover:bg-[#EAF3EF] transition shadow-xs min-h-[38px]"
            title="Update Current GPS Location"
          >
            <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{locating ? 'Locating...' : 'My Location'}</span>
          </button>

          <div className="flex items-center bg-white p-1 rounded-xl border border-border shadow-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition min-h-[34px] ${
                viewMode === 'split'
                  ? 'bg-[#174D3A] text-white shadow-xs'
                  : 'text-[#66736D] hover:text-[#17231F]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition min-h-[34px] ${
                viewMode === 'list'
                  ? 'bg-[#174D3A] text-white shadow-xs'
                  : 'text-[#66736D] hover:text-[#17231F]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition min-h-[34px] ${
                viewMode === 'map'
                  ? 'bg-[#174D3A] text-white shadow-xs'
                  : 'text-[#66736D] hover:text-[#17231F]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-border p-3.5 sm:p-4 shadow-subtle space-y-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#66736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search area, address, or charger (e.g. Kozhikode, 60kW)..."
              className="w-full text-xs sm:text-sm rounded-xl border border-border pl-9 sm:pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#174D3A] focus:border-transparent placeholder-[#66736D]/70 min-h-[42px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  fetchChargers();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-xs sm:text-sm font-semibold transition shadow-xs whitespace-nowrap min-h-[42px]"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/70 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Connector Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#66736D] font-medium hidden xs:inline">Connector:</span>
              <select
                value={connector}
                onChange={e => setConnector(e.target.value as any)}
                className="bg-[#F5F7F4] border border-border rounded-lg px-2 py-1.5 font-medium text-[#17231F] text-xs focus:outline-none focus:ring-1 focus:ring-[#174D3A] min-h-[36px]"
              >
                <option value="all">All Connectors</option>
                <option value="CCS2">CCS2 (DC Fast)</option>
                <option value="Type 2">Type 2 (AC)</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="GB/T">GB/T</option>
              </select>
            </div>

            {/* Min Power Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#66736D] font-medium hidden xs:inline">Power:</span>
              <select
                value={minPower}
                onChange={e => setMinPower(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-[#F5F7F4] border border-border rounded-lg px-2 py-1.5 font-medium text-[#17231F] text-xs focus:outline-none focus:ring-1 focus:ring-[#174D3A] min-h-[36px]"
              >
                <option value="all">Any Power</option>
                <option value="22">22 kW+</option>
                <option value="50">50 kW+</option>
                <option value="100">100 kW+</option>
              </select>
            </div>

            {/* Availability Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#66736D] font-medium hidden xs:inline">Status:</span>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="bg-[#F5F7F4] border border-border rounded-lg px-2 py-1.5 font-medium text-[#17231F] text-xs focus:outline-none focus:ring-1 focus:ring-[#174D3A] min-h-[36px]"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="busy">In Use</option>
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[#66736D] font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#F5F7F4] border border-border rounded-lg px-2 py-1.5 font-medium text-[#17231F] text-xs focus:outline-none focus:ring-1 focus:ring-[#174D3A] min-h-[36px]"
            >
              <option value="nearest">Nearest to Me 📍</option>
              <option value="power_desc">Power (High to Low)</option>
              <option value="price_asc">Tariff (Low to High)</option>
              <option value="name_asc">Name (A–Z)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold p-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Results Section */}
      {error ? (
        <ErrorState message={error} onRetry={fetchChargers} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : chargers.length === 0 ? (
        <EmptyState
          title="No chargers match your criteria"
          description="Try relaxing your connector or power filters, or search for a broader area."
          actionText="Clear All Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div className="space-y-4">
          {/* Active Results Summary */}
          <div className="flex items-center justify-between text-xs text-[#66736D]">
            <div>
              Showing <span className="font-bold text-[#17231F]">{chargers.length}</span> verified
              chargers {sortBy === 'nearest' && userCoords ? '(sorted by nearest to your location)' : ''}
            </div>
            {selectedCharger && (
              <button
                onClick={() => setSelectedCharger(null)}
                className="text-[#174D3A] font-semibold hover:underline"
              >
                Clear pinned
              </button>
            )}
          </div>

          {/* Split View Layout */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Panel on top on mobile, right side on desktop */}
              <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-24 w-full">
                <ChargerMap
                  chargers={chargers}
                  selectedCharger={selectedCharger}
                  onSelectCharger={c => setSelectedCharger(c)}
                  userCoords={userCoords}
                  className="h-[300px] sm:h-[400px] lg:h-[620px] w-full rounded-2xl shadow-card"
                />
              </div>

              {/* List Column */}
              <div className="lg:col-span-7 order-2 lg:order-1 space-y-4 max-h-none lg:max-h-[780px] lg:overflow-y-auto lg:pr-1">
                {chargers.map(charger => (
                  <div
                    key={charger.id}
                    className={`transition ${
                      selectedCharger?.id === charger.id ? 'ring-2 ring-[#174D3A] rounded-2xl' : ''
                    }`}
                  >
                    <ChargerCard
                      charger={charger}
                      onSelectOnMap={c => {
                        setSelectedCharger(c);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      userCoords={userCoords}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List Only Layout */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {chargers.map(charger => (
                <ChargerCard
                  key={charger.id}
                  charger={charger}
                  userCoords={userCoords}
                />
              ))}
            </div>
          )}

          {/* Map Only Layout */}
          {viewMode === 'map' && (
            <div className="space-y-4">
              <ChargerMap
                chargers={chargers}
                selectedCharger={selectedCharger}
                onSelectCharger={c => setSelectedCharger(c)}
                userCoords={userCoords}
                className="h-[520px] sm:h-[680px] w-full rounded-2xl shadow-card"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
