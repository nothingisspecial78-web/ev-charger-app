import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  MapPin,
  CalendarCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Navigation,
  Compass,
} from 'lucide-react';
import { ChargerCard } from '@/components/common/ChargerCard';
import { Charger } from '@/types';

export const LandingPage: React.FC = () => {
  const sampleCharger: Charger = {
    id: 'sample-1',
    owner_id: 'sample-owner',
    name: 'Central Market Fast Charge',
    description: 'High-speed DC fast charger located in the secure ground parking lot of Central Commercial Complex.',
    address: 'Plot 14, Commercial Lane, Near Central Market, Kozhikode, Kerala',
    area: 'Kozhikode Central',
    latitude: 11.2588,
    longitude: 75.7804,
    connector_types: ['CCS2', 'Type 2'],
    power_kw: 60,
    price_per_kwh: 18.5,
    access_notes: 'Entry via Gate 2. Security guard on duty 24/7.',
    availability_status: 'available',
    is_published: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      display_name: 'Kiran V. (Community Host)',
      phone: '+91 98450 12345',
    },
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section with Aurora Glow */}
      <section className="relative overflow-hidden pt-6 sm:pt-12 pb-10 text-center md:text-left">
        {/* Subtle ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-[#174D3A]/10 via-[#C8F169]/15 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF3EF] text-[#174D3A] text-xs font-bold border border-[#C5DED3] shadow-2xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Kerala's Peer-to-Peer Community EV Charging Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17231F] tracking-tight leading-[1.12]">
              Your next charge <br />
              <span className="relative inline-block text-[#174D3A]">
                starts here.
                <span className="absolute bottom-1.5 left-0 w-full h-3 bg-[#C8F169] -z-10 rounded-sm transform -rotate-1 opacity-90"></span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#66736D] max-w-xl leading-relaxed font-normal">
              Find a plug. Request a slot. Get moving. Connect directly with residential and commercial charger hosts, view transparent tariffs, and reserve confirmed charging windows without queues.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <Link
                to="/chargers"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-base font-extrabold transition-all shadow-card hover:shadow-elevated hover:-translate-y-0.5 group"
              >
                <span>Find Nearby Chargers</span>
                <ArrowRight className="w-5 h-5 text-[#C8F169] group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-gray-50 border border-border text-[#17231F] text-base font-bold transition shadow-2xs hover:shadow-sm"
              >
                <span>Host Your Charger</span>
              </Link>
            </div>

            {/* Live Trust Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tabular-nums">60+ kW</div>
                <div className="text-xs font-semibold text-[#66736D] mt-0.5">Rapid DC Supported</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tabular-nums">100%</div>
                <div className="text-xs font-semibold text-[#66736D] mt-0.5">Host-Confirmed Slots</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tabular-nums">₹0 Fees</div>
                <div className="text-xs font-semibold text-[#66736D] mt-0.5">Direct P2P Model</div>
              </div>
            </div>
          </div>

          {/* Interactive Live Card Preview */}
          <div className="md:col-span-5 relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-[#174D3A]/20 to-[#C8F169]/30 rounded-3xl blur-2xl opacity-50 transform -rotate-2"></div>
            <div className="relative space-y-2">
              <div className="bg-[#174D3A] text-white px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center justify-between shadow-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C8F169] animate-pulse"></span>
                  Featured Station Showcase
                </span>
                <span className="text-emerald-200 text-[11px] font-semibold">OpenStreetMap Live</span>
              </div>
              <div className="transform transition-transform hover:scale-[1.01]">
                <ChargerCard charger={sampleCharger} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Pillars / Value Propositions */}
      <section className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#174D3A] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#174D3A]" />
            <span>Why EV Drivers Choose VoltSpot</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231F] tracking-tight">
            Designed for drivers and hosts alike
          </h2>
          <p className="text-sm sm:text-base text-[#66736D] mt-3 leading-relaxed">
            Eliminate range anxiety and crowded charging queues. Every reservation is verified and agreed directly between vehicle owners and station hosts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white rounded-3xl border border-border p-7 shadow-subtle hover:shadow-card transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EAF3EF] to-[#D5E9DF] text-[#174D3A] flex items-center justify-center mb-5 shadow-xs">
              <Zap className="w-7 h-7 fill-current" />
            </div>
            <h3 className="text-xl font-extrabold text-[#17231F] mb-2.5">Transparent Specs</h3>
            <p className="text-sm text-[#66736D] leading-relaxed">
              Verify exact connector standards (CCS2, Type 2, GB/T), certified power output in kW, hourly tariffs, and clear gate access notes before you drive.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-border p-7 shadow-subtle hover:shadow-card transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C8F169]/30 to-[#B5DF57]/40 text-[#174D3A] flex items-center justify-center mb-5 shadow-xs">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[#17231F] mb-2.5">Guaranteed Host Confirmation</h3>
            <p className="text-sm text-[#66736D] leading-relaxed">
              Drivers select preferred arrival time, charge duration, and car model. Hosts confirm the slot, ensuring the plug is reserved specifically for your EV.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-border p-7 shadow-subtle hover:shadow-card transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 flex items-center justify-center mb-5 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[#17231F] mb-2.5">Row-Level Security</h3>
            <p className="text-sm text-[#66736D] leading-relaxed">
              Engineered with PostgreSQL Row Level Security (RLS). Drivers access only their own booking requests, while hosts maintain sovereign listing control.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interactive How It Works Steps */}
      <section className="max-w-7xl mx-auto bg-white rounded-3xl border border-border p-8 sm:p-12 shadow-card">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            How VoltSpot Works in 3 Steps
          </h2>
          <p className="text-sm text-[#66736D] mt-2">
            Effortless peer-to-peer charging from discovery to plug-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#174D3A] text-[#C8F169] flex items-center justify-center font-extrabold text-base shadow-xs">
              1
            </div>
            <h4 className="text-lg font-bold text-[#17231F]">Discover Nearby Plugs</h4>
            <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed">
              Filter by power, connector type (CCS2, Type 2), and live owner status. View exact distance and driving time on the interactive map.
            </p>
          </div>

          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#174D3A] text-[#C8F169] flex items-center justify-center font-extrabold text-base shadow-xs">
              2
            </div>
            <h4 className="text-lg font-bold text-[#17231F]">Request a Time Slot</h4>
            <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed">
              Pick your desired start time, duration, and optional vehicle note. View live energy and tariff calculations before submitting.
            </p>
          </div>

          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-[#174D3A] text-[#C8F169] flex items-center justify-center font-extrabold text-base shadow-xs">
              3
            </div>
            <h4 className="text-lg font-bold text-[#17231F]">Host Confirms & Charge</h4>
            <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed">
              The host approves your session. Open turn-by-turn Google Maps navigation, arrive at the station, and plug in with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CTA Banner */}
      <section className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#174D3A] via-[#1A5741] to-[#123D2E] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-card border border-[#174D3A]">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C8F169] text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Kerala Chargers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to find your charging spot?
            </h2>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
              Browse verified private & commercial stations in Kozhikode and surrounding areas.
            </p>
          </div>
          <Link
            to="/chargers"
            className="px-8 py-4 rounded-xl bg-[#C8F169] text-[#17231F] hover:bg-[#B5DF57] text-base font-extrabold transition-all whitespace-nowrap shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2.5"
          >
            <span>Open Discovery Hub</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
