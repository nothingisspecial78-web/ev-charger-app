import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Charger } from '@/types';
import { useNavigate } from 'react-router-dom';
import { getGoogleMapsNavUrl, calculateDistanceKm, estimateDrivingMinutes } from '@/utils/geo';

interface ChargerMapProps {
  chargers: Charger[];
  selectedCharger?: Charger | null;
  onSelectCharger?: (charger: Charger) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  className?: string;
}

export const ChargerMap: React.FC<ChargerMapProps> = ({
  chargers,
  selectedCharger,
  onSelectCharger,
  userCoords,
  className = 'h-[460px] w-full rounded-2xl',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const geoChargers = chargers.filter(c => c.latitude && c.longitude);
    const defaultCenter: [number, number] = userCoords
      ? [userCoords.latitude, userCoords.longitude]
      : geoChargers.length > 0
      ? [geoChargers[0].latitude!, geoChargers[0].longitude!]
      : [11.2588, 75.7804]; // Kozhikode default

    // Initialize map if not yet done
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle window resize smoothly
      const handleResize = () => map.invalidateSize();
      window.addEventListener('resize', handleResize);
    }

    const map = mapInstanceRef.current;
    map.invalidateSize();

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // 1. Add User Location Marker if available
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute w-8 h-8 rounded-full bg-blue-500 opacity-40 animate-ping"></span>
            <span class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      userMarkerRef.current = L.marker([userCoords.latitude, userCoords.longitude], {
        icon: userIcon,
      })
        .addTo(map)
        .bindPopup('<div class="font-bold text-xs p-1">📍 You Are Here</div>');
    }

    // 2. Add Charger Markers
    const bounds = L.latLngBounds([]);
    if (userCoords) {
      bounds.extend([userCoords.latitude, userCoords.longitude]);
    }

    geoChargers.forEach(charger => {
      const lat = charger.latitude!;
      const lng = charger.longitude!;
      bounds.extend([lat, lng]);

      const dist = userCoords ? calculateDistanceKm(userCoords.latitude, userCoords.longitude, lat, lng) : null;
      const drivingMins = dist ? estimateDrivingMinutes(dist) : null;
      const navUrl = getGoogleMapsNavUrl(lat, lng, charger.address);

      const customIcon = L.divIcon({
        className: 'volt-custom-marker',
        html: `
          <div class="volt-map-pin ${
            charger.availability_status === 'busy'
              ? 'bg-amber-600'
              : charger.availability_status === 'offline'
              ? 'bg-gray-600'
              : 'bg-[#174D3A]'
          }">
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

      // Popup Content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-xs min-w-[200px]';
      popupContent.innerHTML = `
        <div class="font-bold text-sm text-[#17231F] leading-tight">${charger.name}</div>
        <div class="text-[#66736D] mt-0.5 text-[11px]">${charger.area || charger.address}</div>
        
        <div class="flex items-center gap-2 mt-2 font-semibold">
          <span class="text-[#174D3A]">${charger.power_kw} kW</span>
          <span class="text-gray-300">•</span>
          <span>${charger.connector_types.join(', ')}</span>
        </div>

        ${
          dist !== null
            ? `
          <div class="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-1.5 mt-2 text-[11px] font-semibold flex items-center justify-between">
            <span>🚗 ~${dist.toFixed(1)} km away</span>
            <span>~${drivingMins} mins</span>
          </div>
        `
            : ''
        }

        <div class="grid grid-cols-2 gap-1.5 mt-2.5">
          <button id="view-charger-${charger.id}" class="py-1.5 px-2 bg-[#174D3A] text-white rounded-lg font-bold text-center hover:bg-[#123D2E] transition text-[11px]">
            Request Slot
          </button>
          <a href="${navUrl}" target="_blank" rel="noopener noreferrer" class="py-1.5 px-2 bg-blue-600 text-white rounded-lg font-bold text-center hover:bg-blue-700 transition text-[11px] flex items-center justify-center gap-1">
            Google Maps
          </a>
        </div>
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
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [chargers, navigate, onSelectCharger, userCoords]);

  // Route drawing when charger is selected
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove previous route
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (selectedCharger?.latitude && selectedCharger?.longitude) {
      const chargerLat = selectedCharger.latitude;
      const chargerLng = selectedCharger.longitude;

      if (userCoords) {
        // Draw dashed route line from user to destination
        const latlngs: [number, number][] = [
          [userCoords.latitude, userCoords.longitude],
          [chargerLat, chargerLng],
        ];

        routeLineRef.current = L.polyline(latlngs, {
          color: '#174D3A',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.8,
        }).addTo(map);

        const routeBounds = L.latLngBounds(latlngs);
        map.fitBounds(routeBounds, { padding: [60, 60], maxZoom: 14 });
      } else {
        map.setView([chargerLat, chargerLng], 14, { animate: true });
      }

      const marker = markersRef.current[selectedCharger.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedCharger, userCoords]);

  return (
    <div className={`relative overflow-hidden border border-border shadow-card ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-border shadow-xs text-[10px] sm:text-[11px] font-semibold text-[#17231F] flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#174D3A]" />
        <span>OpenStreetMap Live</span>
      </div>
    </div>
  );
};
