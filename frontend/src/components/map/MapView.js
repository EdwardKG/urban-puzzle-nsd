import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Proper static imports for marker images so CRA resolves them
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Patch default icon (Leaflet expects images at runtime)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to react to center/zoom prop changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

/**
 * MapView component
 * Props:
 *  - center: [lat, lng]
 *  - zoom: number
 *  - markers: [{ id, position:[lat,lng], title?, description? }]
 *  - height, width: CSS size strings
 *  - onMarkerClick: (markerObj)=>void
 *  - scrollWheelZoom: boolean
 */
export default function MapView({
  center = [48.1486, 17.1077],
  zoom = 13,
  markers = [],
  height = '500px',
  width = '100%',
  onMarkerClick,
  scrollWheelZoom = true,
}) {
  return (
    <div style={{ width, height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        style={{ width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <ChangeView center={center} zoom={zoom} />
        {markers.map(m => (
          <Marker
            key={m.id}
            position={m.position}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(m),
            }}
          >
            {(m.title || m.description) && (
              <Popup>
                {m.title && <strong style={{ display: 'block', marginBottom: 4 }}>{m.title}</strong>}
                {m.description && <span>{m.description}</span>}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

