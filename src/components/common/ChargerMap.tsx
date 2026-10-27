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
  className = 'h-[480px] w-full rounded-2xl',
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

    // 1. Add user location marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div class="relative flex h-8 w-8 items-center justify-center"><span class="relative h-4 w-4 rounded-full border-2 border-accent bg-primary"></span></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      userMarkerRef.current = L.marker([userCoords.latitude, userCoords.longitude], {
        icon: userIcon,
      })
        .addTo(map)
        .bindPopup('<div class="p-1 text-xs font-semibold">Your location</div>');
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
      const isSelected = selectedCharger?.id === charger.id;

      const markerColor =
        charger.availability_status === 'busy'
          ? 'bg-amber-600'
          : charger.availability_status === 'offline'
          ? 'bg-gray-600'
          : 'bg-primary';

      const customIcon = L.divIcon({
        className: 'volt-custom-marker',
        html: `
          <div class="relative flex items-center justify-center">
            ${isSelected ? '<span class="volt-radar-ring"></span>' : ''}
            <div class="volt-map-pin ${markerColor}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Build popup nodes with textContent so listing data can never become HTML.
      const popupContent = document.createElement('div');
      popupContent.className = 'min-w-[210px] space-y-2 p-1 font-sans text-xs';
      const title = document.createElement('div');
      title.className = 'font-semibold text-sm leading-tight';
      title.textContent = charger.name;
      const location = document.createElement('div');
      location.className = 'text-[11px] text-muted';
      location.textContent = charger.area || charger.address;
      const specs = document.createElement('div');
      specs.className = 'text-[11px] font-semibold text-primary';
      specs.textContent = `${charger.power_kw} kW · ${charger.price_per_kwh ? `₹${charger.price_per_kwh}/kWh` : 'Free'} · ${charger.connector_types.join(', ')}`;
      popupContent.append(title, location, specs);
      if (dist !== null) {
        const distance = document.createElement('div');
        distance.className = 'rounded-lg bg-primary-50 p-1.5 text-[11px] font-semibold text-primary';
        distance.textContent = `About ${dist.toFixed(1)} km away · ${drivingMins} min drive`;
        popupContent.append(distance);
      }
      const actions = document.createElement('div');
      actions.className = 'flex gap-1.5 border-t border-border pt-2';
      const viewButton = document.createElement('button');
      viewButton.className = 'flex-1 rounded-lg bg-primary px-2.5 py-2 text-[11px] font-semibold text-white';
      viewButton.textContent = 'View details';
      viewButton.addEventListener('click', () => {
        navigate(`/chargers/${charger.id}`);
      });
      const directions = document.createElement('a');
      directions.href = navUrl;
      directions.target = '_blank';
      directions.rel = 'noopener noreferrer';
      directions.className = 'rounded-lg border border-border px-2 py-2 text-[11px] font-semibold text-foreground';
      directions.textContent = 'Directions';
      actions.append(viewButton, directions);
      popupContent.append(actions);

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectCharger) onSelectCharger(charger);
      });

      markersRef.current[charger.id] = marker;
    });

    if (geoChargers.length > 0 && !selectedCharger) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [chargers, navigate, onSelectCharger, userCoords, selectedCharger]);

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
        const latlngs: [number, number][] = [
          [userCoords.latitude, userCoords.longitude],
          [chargerLat, chargerLng],
        ];

        routeLineRef.current = L.polyline(latlngs, {
          color: 'var(--primary)',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85,
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
    </div>
  );
};
