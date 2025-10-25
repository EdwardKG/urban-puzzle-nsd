import React, { useMemo, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Convert app polygons (points as [lat, lng]) to proper GeoJSON (coordinates [lng, lat])
const toGeoJSON = (polygons) => {
  const features = polygons.map(p => {
    const ring = p.points.map(([lat, lng]) => [lng, lat]);
    if (ring.length > 0) {
      // Ensure ring closed
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);
    }
    return {
      type: 'Feature',
      properties: {
        id: p.id,
        color: p.color || '#1f4d9b',
        fillColor: p.fillColor || 'rgba(31,77,155,0.4)',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
    };
  });
  return { type: 'FeatureCollection', features };
};

export default function CustomStyledMapView({
  center = [48.1486, 17.1077], // incoming center as [lat, lng]
  zoom = 14,
  polygons = [],
  height = '600px',
  width = '100%',
  mapStyleUrl,
  useViewportHeight = false, // new: if true ignore height and fill viewport
  maxHeightOffset = 0, // new: subtract pixels (e.g. header height)
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const polygonGeoJSON = useMemo(() => toGeoJSON(polygons), [polygons]);

  // Initialize map
  useEffect(() => {
    if (!mapStyleUrl) return; // skip until style provided
    if (mapRef.current || !mapContainerRef.current) return;
    const [lat, lng] = center; // note order; maplibre expects [lng, lat]
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyleUrl,
      center: [lng, lat],
      zoom,
    });
    mapRef.current.on('load', () => {
      // Add source for polygons
      if (!mapRef.current.getSource('custom-polygons')) {
        mapRef.current.addSource('custom-polygons', {
          type: 'geojson',
          data: polygonGeoJSON,
        });
      }
      // Fill layer
      if (!mapRef.current.getLayer('custom-polygons-fill')) {
        mapRef.current.addLayer({
          id: 'custom-polygons-fill',
          type: 'fill',
          source: 'custom-polygons',
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': 0.4,
          },
        });
      }
      // Outline layer
      if (!mapRef.current.getLayer('custom-polygons-outline')) {
        mapRef.current.addLayer({
          id: 'custom-polygons-outline',
          type: 'line',
            source: 'custom-polygons',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2,
          },
        });
      }
    });
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapStyleUrl, center, zoom, polygonGeoJSON]);

  // Update center / zoom when props change
  useEffect(() => {
    if (!mapRef.current) return;
    const [lat, lng] = center;
    mapRef.current.setCenter([lng, lat]);
    mapRef.current.setZoom(zoom);
  }, [center, zoom]);

  // Update polygon data when polygons change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) {
      const src = map.getSource('custom-polygons');
      if (src) src.setData(polygonGeoJSON);
    } else {
      // If style not yet loaded, attach one-time listener
      map.once('load', () => {
        const src = map.getSource('custom-polygons');
        if (src) src.setData(polygonGeoJSON);
      });
    }
  }, [polygonGeoJSON]);

  // Resize map on window resize if using viewport height
  useEffect(() => {
    if (!useViewportHeight) return;
    const handler = () => {
      if (mapRef.current) mapRef.current.resize();
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [useViewportHeight]);

  if (!mapStyleUrl) {
    return (
      <div style={{ width, height: useViewportHeight ? `calc(100vh - ${maxHeightOffset}px)` : height, display: 'grid', placeContent: 'center', background: '#eee' }}>
        <p style={{ color: '#555' }}>Missing mapStyleUrl prop.</p>
      </div>
    );
  }

  return <div ref={mapContainerRef} style={{ width: width, height: useViewportHeight ? `calc(100vh - ${maxHeightOffset}px)` : height, maxHeight: '100vh', borderRadius: 0, overflow: 'hidden', margin: 0, padding: 0 }} />;
}