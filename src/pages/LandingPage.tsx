import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Charger } from '@/types';
import { ChargerCard } from '@/components/common/ChargerCard';

const exampleCharger: Charger = {
  id: 'example-listing', owner_id: 'example-owner', name: 'Central Market Fast Charge', description: 'A sample listing', address: 'Commercial Lane, Kozhikode', area: 'Kozhikode Central', latitude: 11.2588, longitude: 75.7804, connector_types: ['CCS2', 'Type 2'], power_kw: 60, price_per_kwh: 18.5, access_notes: 'Entry via Gate 2', availability_status: 'available', is_published: true, is_active: true, created_at: '', updated_at: '',
};

export const LandingPage: React.FC = () => (
  <div className="space-y-20 pb-8 sm:space-y-28">
    <section className="grid items-center gap-10 pt-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-10">
      <div>
        <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl sm:leading-[1.08]">Your next charge starts here.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">Find a charger, request a time slot, and get a clear answer from the host before you set out.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/chargers" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover">Find a charger<ArrowRight className="h-4 w-4 text-accent" /></Link><Link to="/signup" className="inline-flex min-h-[48px] items-center justify-center rounded-control border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-surface-muted">Host your charger</Link></div>
        <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-3"><div><p className="font-semibold text-foreground">Clear specs</p><p className="mt-1 text-sm text-muted">Power, tariff, and connectors up front.</p></div><div><p className="font-semibold text-foreground">Owner-managed</p><p className="mt-1 text-sm text-muted">Listings reflect host-reported status.</p></div><div><p className="font-semibold text-foreground">Track requests</p><p className="mt-1 text-sm text-muted">Follow every request in one place.</p></div></div>
      </div>
      <div className="rounded-card border border-border bg-surface p-3 sm:p-4"><div className="flex items-center justify-between border-b border-border px-2 pb-3"><span className="text-sm font-semibold text-foreground">Example listing</span><span className="text-xs text-muted">Owner-reported details</span></div><div className="pt-3"><ChargerCard charger={exampleCharger} /></div></div>
    </section>

    <section><div className="max-w-2xl"><h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">A simpler path to the plug.</h2><p className="mt-3 text-base leading-7 text-muted">VoltSpot keeps discovery, requests, and host confirmation in one calm workflow.</p></div><ol className="mt-8 grid gap-8 border-t border-border pt-8 md:grid-cols-3"><li><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">1</div><h3 className="mt-4 text-lg font-semibold">Discover a charger</h3><p className="mt-2 text-sm leading-6 text-muted">Search by area, compare power and connectors, and check the owner-reported availability.</p></li><li><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">2</div><h3 className="mt-4 text-lg font-semibold">Request a slot</h3><p className="mt-2 text-sm leading-6 text-muted">Choose your arrival time, duration, and add a note for the host if useful.</p></li><li><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent">3</div><h3 className="mt-4 text-lg font-semibold">Get confirmation</h3><p className="mt-2 text-sm leading-6 text-muted">Track the request and see the host response before you head to the charger.</p></li></ol></section>

    <section className="rounded-card border border-primary bg-primary p-6 text-white sm:p-10"><div className="grid items-center gap-6 md:grid-cols-[1fr_auto]"><div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to find your charging spot?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-primary-100">Browse the current VoltSpot listings and request a time that fits your route.</p></div><Link to="/chargers" className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-control bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">Open discovery<ArrowRight className="h-4 w-4" /></Link></div></section>
  </div>
);
