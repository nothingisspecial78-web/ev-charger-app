import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, MapPin, CalendarCheck, ArrowRight, Sparkles } from 'lucide-react';
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
    connector_types: ['CCS2'],
    power_kw: 60,
    price_per_kwh: 18.5,
    access_notes: 'Entry via Gate 2. Guard present 24/7.',
    availability_status: 'available',
    is_published: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      display_name: 'Kiran (Host)',
      phone: '+91 98450 12345',
    },
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-16 pb-12 text-center md:text-left">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3EF] text-[#174D3A] text-xs font-bold border border-[#C5DED3]">
              <Sparkles className="w-3.5 h-3.5 text-[#174D3A]" />
              <span>Next-Gen Community & Private EV Charger Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17231F] tracking-tight leading-[1.15]">
              Your next charge <br />
              <span className="text-[#174D3A] underline decoration-[#C8F169] decoration-4 underline-offset-6">
                starts here.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#66736D] max-w-xl leading-relaxed">
              Find a plug. Request a slot. Get moving. Connect with local charger hosts, review transparent specs, and reserve your charging window in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                to="/chargers"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#174D3A] hover:bg-[#123D2E] text-white text-base font-bold transition shadow-card"
              >
                <span>Find a Charger</span>
                <ArrowRight className="w-5 h-5 text-[#C8F169]" />
              </Link>
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-border text-[#17231F] text-base font-semibold transition"
              >
                <span>List Your Charger</span>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/80">
              <div>
                <div className="text-2xl font-extrabold text-[#17231F]">60+ kW</div>
                <div className="text-xs text-[#66736D]">Rapid DC Available</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[#17231F]">100%</div>
                <div className="text-xs text-[#66736D]">Host Confirmed</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[#17231F]">0 Fees</div>
                <div className="text-xs text-[#66736D]">Direct Host Model</div>
              </div>
            </div>
          </div>

          {/* Interactive Preview Card */}
          <div className="md:col-span-5 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#174D3A] to-[#C8F169] rounded-3xl blur-xl opacity-20 transform -rotate-1"></div>
            <div className="relative">
              <div className="bg-[#174D3A] text-white p-3 rounded-t-2xl text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C8F169] animate-pulse"></span>
                  Verified Listing Preview
                </span>
                <span className="text-gray-300">OpenStreetMap Ready</span>
              </div>
              <ChargerCard charger={sampleCharger} />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars / Value Props */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231F]">
            Designed for drivers and hosts alike
          </h2>
          <p className="text-sm text-[#66736D] mt-2">
            No unexpected queueing, no ambiguous plug types. Every session is coordinated directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-subtle hover:shadow-card transition">
            <div className="w-12 h-12 rounded-xl bg-[#EAF3EF] text-[#174D3A] flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-lg font-bold text-[#17231F] mb-2">Transparent Specs</h3>
            <p className="text-sm text-[#66736D] leading-relaxed">
              Verify exact connector standards (CCS2, Type 2), power in kW, tariffs, and parking access instructions before leaving home.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-subtle hover:shadow-card transition">
            <div className="w-12 h-12 rounded-xl bg-[#C8F169]/30 text-[#174D3A] flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#17231F] mb-2">Host Decision Flow</h3>
            <p className="text-sm text-[#66736D] leading-relaxed">
              Drivers specify date, duration, and vehicle notes. Charger owners approve or decline slots based on their actual capacity.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-subtle hover:shadow-card transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#17231F] mb-2">Secure & Reliable</h3>
            <p className="text-sm text-[#66736D] leading-relaxed">
              Protected by PostgreSQL Row Level Security (RLS). Drivers access only their own sessions, and hosts maintain complete listing ownership.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto">
        <div className="bg-[#174D3A] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to find a charging spot?
            </h2>
            <p className="text-gray-200 text-sm sm:text-base">
              Explore active chargers on the interactive map or browse the filtered list.
            </p>
          </div>
          <Link
            to="/chargers"
            className="px-6 py-3.5 rounded-xl bg-[#C8F169] text-[#17231F] hover:bg-[#B5DF57] text-base font-bold transition whitespace-nowrap shadow-md flex items-center gap-2"
          >
            <span>Explore Discovery View</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
