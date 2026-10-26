import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Charger } from '@/types';
import { useNavigate } from 'react-router-dom';

interface ChargerMapProps {
  chargers: Charger[];
  selectedCharger?: Charger | null;
  onSelectCharger?: (charger: Charger) => void;
  className?: string;
}

export const ChargerMap: React.FC<ChargerMapProps> = ({
  chargers,
  selectedCharger,
  onSelectCharger,
  className = 'h-[460px] w-full rounded-2xl',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Filter chargers that have valid coordinates
    const geoChargers = chargers.filter(c => c.latitude && c.longitude);
    const defaultCenter: [number, number] = geoChargers.length > 0
      ? [geoChargers[0].latitude!, geoChargers[0].longitude!]
      : [11.2588, 75.7804]; // Kozhikode default

    // Initialize map if not yet done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for all geo chargers
    const bounds = L.latLngBounds([]);

    geoChargers.forEach(charger => {
      const lat = charger.latitude!;
      const lng = charger.longitude!;
      bounds.extend([lat, lng]);

      // Custom icon
      const customIcon = L.divIcon({
        className: 'volt-custom-marker',
        html: `
          <div class="volt-map-pin ${charger.availability_status === 'busy' ? 'bg-amber-600' : charger.availability_status === 'offline' ? 'bg-gray-600' : 'bg-[#174D3A]'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-xs';
      popupContent.innerHTML = `
        <div class="font-bold text-sm text-[#17231F]">${charger.name}</div>
        <div class="text-[#66736D] mt-0.5">${charger.area || charger.address}</div>
        <div class="flex items-center gap-2 mt-2">
          <span class="font-bold text-[#174D3A]">${charger.power_kw} kW</span>
          <span class="text-gray-300">•</span>
          <span>${charger.connector_types.join(', ')}</span>
        </div>
        <button id="view-charger-${charger.id}" class="mt-2.5 w-full py-1.5 px-3 bg-[#174D3A] text-white rounded-lg font-semibold text-center hover:bg-[#123D2E] transition">
          View & Request Slot
        </button>
      `;

      popupContent.querySelector(`#view-charger-${charger.id}`)?.addEventListener('click', () => {
        navigate(`/chargers/${charger.id}`);
      });

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectCharger) onSelectCharger(charger);
      });

      markersRef.current[charger.id] = marker;
    });

    if (geoChargers.length > 0 && !selectedCharger) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    return () => {
      // Keep map alive unless unmounting whole view
    };
  }, [chargers, navigate, onSelectCharger]);

  // Pan to selected charger
  useEffect(() => {
    if (selectedCharger?.latitude && selectedCharger?.longitude && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [selectedCharger.latitude, selectedCharger.longitude],
        14,
        { animate: true }
      );
      const marker = markersRef.current[selectedCharger.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedCharger]);

  return (
    <div className={`relative overflow-hidden border border-border shadow-card ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-xs text-[11px] font-semibold text-[#17231F] flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#174D3A]" />
        <span>Live Interactive OpenStreetMap</span>
      </div>
    </div>
  );
};
