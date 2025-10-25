import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker image imports (so CRA can resolve them)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

/**
 * MapViewShapes component
 * Props:
 *  - center: [lat, lng]
 *  - zoom: number
 *  - markers: [{ id, position:[lat,lng], title?, description? }]
 *  - polygons: [{ id, points:[[lat,lng],...], title?, description?, color?, fillColor? }]
 *  - onMarkerClick: (markerObj)=>void
 *  - onPolygonClick: (polygonObj)=>void
 *  - height, width: CSS size strings
 *  - scrollWheelZoom: boolean
 */
export default function MapViewShapes({
  center = [48.1486, 17.1077],
  zoom = 13,
  markers = [],
  polygons = [],
  onMarkerClick,
  onPolygonClick,
  height = '600px',
  width = '100%',
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
            eventHandlers={{ click: () => onMarkerClick && onMarkerClick(m) }}
          >
            {(m.title || m.description) && (
              <Popup>
                {m.title && <strong style={{ display: 'block', marginBottom: 4 }}>{m.title}</strong>}
                {m.description && <span>{m.description}</span>}
              </Popup>
            )}
          </Marker>
        ))}
        {polygons.map(p => (
          <Polygon
            key={p.id}
            positions={p.points}
            pathOptions={{
              color: p.color || '#064',
              weight: 2,
              fillColor: p.fillColor || p.color || '#0a4',
              fillOpacity: 0.35,
            }}
            eventHandlers={{ click: () => onPolygonClick && onPolygonClick(p) }}
          >
            {(p.title || p.description) && (
              <Popup>
                {p.title && <strong style={{ display: 'block', marginBottom: 4 }}>{p.title}</strong>}
                {p.description && <span>{p.description}</span>}
              </Popup>
            )}
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
}

