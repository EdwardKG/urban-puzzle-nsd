import React, { useState } from 'react';
import MapViewShapes from '../components/map/MapViewShapes';

export default function MapPage() {
  const [center, setCenter] = useState([48.1486, 17.1077]);
  const [zoom, setZoom] = useState(13);
  const [markers, setMarkers] = useState([
    { id: 1, position: [48.1486, 17.1077], title: 'Bratislava Castle', description: 'Historic site' },
    { id: 2, position: [48.1439, 17.1097], title: "St. Martin's Cathedral", description: 'Gothic cathedral' },
  ]);
  const [selected, setSelected] = useState(null);
  const [polygons, setPolygons] = useState([]); // building shapes
  const [polyPoints, setPolyPoints] = useState(6); // default N
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  const addRandomMarker = () => {
    const id = Date.now();
    const lat = center[0] + (Math.random() - 0.5) * 0.02;
    const lng = center[1] + (Math.random() - 0.5) * 0.02;
    setMarkers([...markers, { id, position: [lat, lng], title: `Marker ${id}`, description: 'Random point' }]);
  };

  const handleMarkerClick = (m) => {
    setSelected(m);
    setCenter(m.position);
    setZoom(15);
  };

  const addBuildingShape = () => {
    const id = `poly-${Date.now()}`;
    const N = Math.max(3, polyPoints);
    const radiusMeters = 120; // building footprint radius
    // Approx conversions (1 deg lat ≈ 111,320 m; 1 deg lon ≈ 111,320 * cos(lat) m)
    const lat = center[0];
    const lon = center[1];
    const latFactor = 1 / 111320;
    const lonFactor = 1 / (111320 * Math.cos((lat * Math.PI) / 180));
    const points = Array.from({ length: N }, (_, i) => {
      const angle = (2 * Math.PI * i) / N;
      const dx = radiusMeters * Math.cos(angle);
      const dy = radiusMeters * Math.sin(angle);
      return [lat + dy * latFactor, lon + dx * lonFactor];
    });
    setPolygons([...polygons, { id, points, title: `Building ${polygons.length + 1}`, description: `${N}-sided footprint`, color: '#8a2be2' }]);
  };

  const handlePolygonClick = (p) => {
    setSelectedPolygon(p);
    // Center map on polygon approximate centroid
    const avg = p.points.reduce((acc, pt) => [acc[0] + pt[0], acc[1] + pt[1]], [0, 0]);
    const centroid = [avg[0] / p.points.length, avg[1] / p.points.length];
    setCenter(centroid);
    setZoom(16);
  };

  return (
    <div className='map-page' style={{ padding: '1rem' }}>
      <h2>City Map</h2>
      <p>Interactive OpenStreetMap based view. Click markers or building shapes.</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button onClick={addRandomMarker}>Add Random Marker</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          Zoom: {zoom}
          <input type='range' min={10} max={18} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
        </label>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <input type='number' step='0.001' value={center[0]} onChange={(e) => setCenter([Number(e.target.value), center[1]])} />
          <input type='number' step='0.001' value={center[1]} onChange={(e) => setCenter([center[0], Number(e.target.value)])} />
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <label>N points:
            <input style={{ width: 60 }} type='number' min={3} max={20} value={polyPoints} onChange={(e) => setPolyPoints(Number(e.target.value))} />
          </label>
          <button onClick={addBuildingShape}>Add Building Shape</button>
        </div>
      </div>
      {selected && (
        <div style={{ background: '#eef', padding: '.75rem', borderRadius: 6, marginBottom: '1rem' }}>
          <strong>{selected.title}</strong><br />
          {selected.description}<br />
          <small>{selected.position[0].toFixed(4)}, {selected.position[1].toFixed(4)}</small>
        </div>
      )}
      {selectedPolygon && (
        <div style={{ background: '#efe', padding: '.75rem', borderRadius: 6, marginBottom: '1rem' }}>
          <strong>{selectedPolygon.title}</strong><br />
          {selectedPolygon.description}<br />
          <small>{selectedPolygon.points.length} points</small>
        </div>
      )}
      <MapViewShapes
        center={center}
        zoom={zoom}
        markers={markers}
        polygons={polygons}
        onMarkerClick={handleMarkerClick}
        onPolygonClick={handlePolygonClick}
        height='600px'
      />
      <div style={{ marginTop: '1rem' }}>
        <h3>Markers ({markers.length})</h3>
        <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {markers.map(m => (
            <div key={m.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '.75rem', borderRadius: 6, cursor: 'pointer' }} onClick={() => handleMarkerClick(m)}>
              <strong>{m.title}</strong>
              <div style={{ fontSize: 12, color: '#666' }}>{m.position[0].toFixed(4)}, {m.position[1].toFixed(4)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h3>Building Shapes ({polygons.length})</h3>
        <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {polygons.map(p => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '.75rem', borderRadius: 6, cursor: 'pointer' }} onClick={() => handlePolygonClick(p)}>
              <strong>{p.title}</strong>
              <div style={{ fontSize: 12, color: '#666' }}>{p.points.length} vertices</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
