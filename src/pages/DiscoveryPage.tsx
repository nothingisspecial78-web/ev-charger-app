import React, { useState, useEffect } from 'react';
import { Charger, ChargerFilters, ConnectorType, AvailabilityStatus } from '@/types';
import { DataService } from '@/services/dataService';
import { ChargerCard } from '@/components/common/ChargerCard';
import { ChargerMap } from '@/components/common/ChargerMap';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/common/Feedback';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Map,
  List,
  X,
  Zap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [query, setQuery] = useState('');
  const [connector, setConnector] = useState<ConnectorType | 'all'>('all');
  const [minPower, setMinPower] = useState<number | 'all'>('all');
  const [status, setStatus] = useState<AvailabilityStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'power_desc' | 'power_asc' | 'price_asc' | 'name_asc'>('power_desc');

  // UI state
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);

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
      setChargers(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load chargers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargers();
  }, [connector, minPower, status, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChargers();
  };

  const clearAllFilters = () => {
    setQuery('');
    setConnector('all');
    setMinPower('all');
    setStatus('all');
    setSortBy('power_desc');
  };

  const hasActiveFilters =
    Boolean(query) || connector !== 'all' || minPower !== 'all' || status !== 'all';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#174D3A] uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 fill-current" />
            <span>Driver Discovery Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            Find your next charge
          </h1>
          <p className="text-sm text-[#66736D] mt-1">
            Discover verified hosts, inspect real-time connector power, and submit structured reservation requests.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-border shadow-xs self-start md:self-auto">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'split'
                ? 'bg-[#174D3A] text-white shadow-xs'
                : 'text-[#66736D] hover:text-[#17231F]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'map'
                ? 'bg-[#174D3A] text-white shadow-xs'
                : 'text-[#66736D] hover:text-[#17231F]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map Only</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-subtle space-y-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#66736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search area, address, or charger name (e.g. Kozhikode, Central, 60kW)..."
              className="w-full text-sm rounded-xl border border-border pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#174D3A] focus:border-transparent placeholder-[#66736D]/70"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  fetchChargers();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-sm font-semibold transition shadow-xs whitespace-nowrap"
          >
            Search
          </button>
        </form>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/70">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Connector Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#66736D] font-medium">Connector:</span>
              <select
                value={connector}
                onChange={e => setConnector(e.target.value as any)}
                className="bg-[#F5F7F4] border border-border rounded-lg px-2.5 py-1.5 font-medium text-[#17231F] focus:outline-none focus:ring-1 focus:ring-[#174D3A]"
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
              <span className="text-[#66736D] font-medium">Power:</span>
              <select
                value={minPower}
                onChange={e => setMinPower(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-[#F5F7F4] border border-border rounded-lg px-2.5 py-1.5 font-medium text-[#17231F] focus:outline-none focus:ring-1 focus:ring-[#174D3A]"
              >
                <option value="all">Any Power</option>
                <option value="22">22 kW+ (Fast AC/DC)</option>
                <option value="50">50 kW+ (Rapid DC)</option>
                <option value="100">100 kW+ (Ultra-Rapid)</option>
              </select>
            </div>

            {/* Availability Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#66736D] font-medium">Status:</span>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="bg-[#F5F7F4] border border-border rounded-lg px-2.5 py-1.5 font-medium text-[#17231F] focus:outline-none focus:ring-1 focus:ring-[#174D3A]"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available Now</option>
                <option value="busy">In Use</option>
              </select>
            </div>
          </div>

          {/* Sort By & Clear */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#66736D] font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#F5F7F4] border border-border rounded-lg px-2.5 py-1.5 font-medium text-[#17231F] focus:outline-none focus:ring-1 focus:ring-[#174D3A]"
            >
              <option value="power_desc">Power (High to Low)</option>
              <option value="price_asc">Tariff (Low to High)</option>
              <option value="name_asc">Station Name (A–Z)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Results Section */}
      {error ? (
        <ErrorState message={error} onRetry={fetchChargers} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div>
          {/* Active Results Summary */}
          <div className="flex items-center justify-between text-xs text-[#66736D] mb-4">
            <div>
              Showing <span className="font-bold text-[#17231F]">{chargers.length}</span> published
              charging stations
            </div>
            {selectedCharger && (
              <button
                onClick={() => setSelectedCharger(null)}
                className="text-[#174D3A] font-semibold hover:underline"
              >
                Clear pinned charger ({selectedCharger.name})
              </button>
            )}
          </div>

          {/* Split View Layout */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* List Column */}
              <div className="lg:col-span-7 space-y-4 max-h-[780px] overflow-y-auto pr-1">
                {chargers.map(charger => (
                  <div
                    key={charger.id}
                    className={`transition ${
                      selectedCharger?.id === charger.id ? 'ring-2 ring-[#174D3A] rounded-2xl' : ''
                    }`}
                  >
                    <ChargerCard
                      charger={charger}
                      onSelectOnMap={c => setSelectedCharger(c)}
                    />
                  </div>
                ))}
              </div>

              {/* Map Column */}
              <div className="lg:col-span-5 sticky top-24">
                <ChargerMap
                  chargers={chargers}
                  selectedCharger={selectedCharger}
                  onSelectCharger={c => setSelectedCharger(c)}
                  className="h-[620px] w-full rounded-2xl shadow-card"
                />
              </div>
            </div>
          )}

          {/* List Only Layout */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chargers.map(charger => (
                <ChargerCard key={charger.id} charger={charger} />
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
                className="h-[680px] w-full rounded-2xl shadow-card"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
