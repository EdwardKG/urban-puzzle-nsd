import React, { useState } from 'react';
import MinimalMapView from '../components/map/MinimalMapView';

export default function MapPage() {
  const [center, setCenter] = useState([48.1486, 17.1077]);
  const [zoom, setZoom] = useState(15);
  const [polygons, setPolygons] = useState([]);
  const [polyPoints, setPolyPoints] = useState(6);

  const addBuildingShape = () => {
    const id = `poly-${Date.now()}`;
    const N = Math.max(3, polyPoints);
    const radiusMeters = 120;
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
    setPolygons([...polygons, { id, points, color: '#1f4d9b' }]);
  };

  return (
    <div className='map-page' style={{ padding: '1rem' }}>
      <h2>Building Footprints Map</h2>
      <p>Minimal view: only street names and custom building shapes.</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          Zoom: {zoom}
          <input type='range' min={12} max={19} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
        </label>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <input type='number' step='0.0005' value={center[0]} onChange={(e) => setCenter([Number(e.target.value), center[1]])} />
          <input type='number' step='0.0005' value={center[1]} onChange={(e) => setCenter([center[0], Number(e.target.value)])} />
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <label>N points:
            <input style={{ width: 60 }} type='number' min={3} max={30} value={polyPoints} onChange={(e) => setPolyPoints(Number(e.target.value))} />
          </label>
          <button onClick={addBuildingShape}>Add Building Shape</button>
        </div>
      </div>
      <MinimalMapView
        center={center}
        zoom={zoom}
        polygons={polygons}
        height='600px'
        tileVariant='satelliteWithLabels'
      />
      <div style={{ marginTop: '1rem' }}>
        <h3>Building Shapes ({polygons.length})</h3>
        <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
          {polygons.map(p => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '.75rem', borderRadius: 6 }}>
              <strong>Shape {p.id.split('-')[1]}</strong>
              <div style={{ fontSize: 12, color: '#666' }}>{p.points.length} vertices</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
