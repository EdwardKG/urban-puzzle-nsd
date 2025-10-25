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

// Helper: convert markers (lat,lng) to GeoJSON Points (lng,lat)
const markersToGeoJSON = (markers) => ({
  type: 'FeatureCollection',
  features: markers.map(m => ({
    type: 'Feature',
    properties: {
      id: m.id,
      iconName: m.iconName || m.id, // unique name to map loaded image
      label: m.label || '',
    },
    geometry: {
      type: 'Point',
      coordinates: [m.position[1], m.position[0]],
    },
  }))
});

export default function CustomStyledMapView({
  center = [48.1486, 17.1077], // incoming center as [lat, lng]
  zoom = 14,
  polygons = [],
  markers = [], // NEW markers prop [{id, position:[lat,lng], iconUrl?, iconName?, label?}]
  onMarkerClick, // NEW callback
  height = '600px',
  width = '100%',
  mapStyleUrl,
  useViewportHeight = false, // new: if true ignore height and fill viewport
  maxHeightOffset = 0, // new: subtract pixels (e.g. header height)
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);


  const polygonGeoJSON = useMemo(() => toGeoJSON(polygons), [polygons]);
  const markerGeoJSON = useMemo(() => markersToGeoJSON(markers), [markers]);

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
        mapRef.current.addSource('custom-polygons', { type: 'geojson', data: polygonGeoJSON });
      }
      // Polygon fill layer
      if (!mapRef.current.getLayer('custom-polygons-fill')) {
        mapRef.current.addLayer({
          id: 'custom-polygons-fill',
          type: 'fill',
          source: 'custom-polygons',
          paint: { 'fill-color': ['get', 'fillColor'], 'fill-opacity': 0.4 },
        });
      }
      // Polygon outline layer
      if (!mapRef.current.getLayer('custom-polygons-outline')) {
        mapRef.current.addLayer({
          id: 'custom-polygons-outline',
          type: 'line',
          source: 'custom-polygons',
          paint: { 'line-color': ['get', 'color'], 'line-width': 2 },
        });
      }
      // Markers source
      if (!mapRef.current.getSource('custom-markers')) {
        mapRef.current.addSource('custom-markers', { type: 'geojson', data: markerGeoJSON });
      }
      // Fallback circle layer (always present)
      if (!mapRef.current.getLayer('custom-markers-circle')) {
        mapRef.current.addLayer({
          id: 'custom-markers-circle',
            type: 'circle',
            source: 'custom-markers',
            paint: {
              'circle-radius': 6,
              'circle-color': '#ff5722',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
        });
      }
      // Symbol layer for custom icons + optional text
      if (!mapRef.current.getLayer('custom-markers-symbol')) {
        mapRef.current.addLayer({
          id: 'custom-markers-symbol',
          type: 'symbol',
          source: 'custom-markers',
          layout: {
            'icon-image': ['get', 'iconName'],
            'icon-size': 0.8,
            'icon-allow-overlap': true,
            'text-field': ['get', 'label'],
            'text-size': 12,
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#222',
            'text-halo-color': '#fff',
            'text-halo-width': 1.5,
          }
        });
      }
      // Marker click event
      mapRef.current.on('click', 'custom-markers-circle', (e) => {
        if (onMarkerClick && e.features && e.features[0]) onMarkerClick(e.features[0].properties.id);
      });
      mapRef.current.on('click', 'custom-markers-symbol', (e) => {
        if (onMarkerClick && e.features && e.features[0]) onMarkerClick(e.features[0].properties.id);
      });
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [mapStyleUrl, center, zoom, polygonGeoJSON, markerGeoJSON, onMarkerClick]);

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

  // Load marker custom icons & update marker source when markers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const uniqueIcons = [...new Set(markers.filter(m => m.iconUrl).map(m => m.iconUrl))];
    uniqueIcons.forEach((url) => {
      const name = markers.find(m => m.iconUrl === url)?.iconName || url; // use iconName or url
      if (!map.hasImage(name)) {
        map.loadImage(url, (err, image) => {
          if (err || !image) return;
          if (!map.hasImage(name)) map.addImage(name, image, { pixelRatio: 2 });
        });
      }
    });
    // Update source data
    if (map.isStyleLoaded()) {
      const src = map.getSource('custom-markers');
      if (src) src.setData(markerGeoJSON);
    } else {
      map.once('load', () => {
        const src = map.getSource('custom-markers');
        if (src) src.setData(markerGeoJSON);
      });
    }
  }, [markerGeoJSON, markers]);

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

  return <div ref={mapContainerRef} style={{ width: width, height: useViewportHeight ? `calc(100vh - ${maxHeightOffset}px)` : height,
    maxHeight: '100vh', borderRadius: 0, overflow: 'hidden', margin: 0, padding: 0 }} />;
}