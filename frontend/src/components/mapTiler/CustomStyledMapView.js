import React, { useMemo, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './markers.css';

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
  renderHtmlMarkers = true, // NEW: render separate HTML icon + label markers
  iconOffset = [0, 0], // NEW: pixel offset for icon marker
  labelOffset = [0, 34], // NEW: pixel offset for label marker
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const iconMarkersRef = useRef([]); // track icon markers for cleanup
  const labelMarkersRef = useRef([]); // track label markers for cleanup
  const htmlMarkersInitializedRef = useRef(false);

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
      // Markers source (only if not using HTML markers)
      if (!renderHtmlMarkers && !mapRef.current.getSource('custom-markers')) {
        mapRef.current.addSource('custom-markers', { type: 'geojson', data: markerGeoJSON });
      }
      if (!renderHtmlMarkers) {
        // Fallback circle layer
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
        // Symbol layer
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
        // Marker click events for layer-based markers
        mapRef.current.on('click', 'custom-markers-circle', (e) => {
          if (onMarkerClick && e.features && e.features[0]) onMarkerClick(e.features[0].properties.id);
        });
        mapRef.current.on('click', 'custom-markers-symbol', (e) => {
          if (onMarkerClick && e.features && e.features[0]) onMarkerClick(e.features[0].properties.id);
        });
      } else {
        htmlMarkersInitializedRef.current = true;
      }
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [mapStyleUrl, center, zoom, polygonGeoJSON, markerGeoJSON, onMarkerClick, renderHtmlMarkers]);

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

  // Load marker icons when using style-based markers
  useEffect(() => {
    if (renderHtmlMarkers) return; // skip icon image loading for HTML markers
    const map = mapRef.current;
    if (!map) return;
    const uniqueIcons = [...new Set(markers.filter(m => m.iconUrl).map(m => m.iconUrl))];
    uniqueIcons.forEach((url) => {
      const markerObj = markers.find(m => m.iconUrl === url);
      const name = markerObj?.iconName || url;
      if (map.hasImage(name)) return;
      if (/\.svg($|\?)/i.test(url)) {
        // Manual load for SVG (map.loadImage doesn't handle SVG reliably)
        const img = new Image();
        img.onload = () => {
          if (!map.hasImage(name)) {
            try { map.addImage(name, img, { pixelRatio: 2 }); } catch (e) { console.warn('Failed to add SVG icon', name, e); }
          }
        };
        img.onerror = () => console.warn('Failed to load SVG icon', url);
        img.src = url;
      } else {
        map.loadImage(url, (err, image) => {
          if (err || !image) { console.warn('loadImage failed for', url, err); return; }
          if (!map.hasImage(name)) map.addImage(name, image, { pixelRatio: 2 });
        });
      }
    });
  }, [markerGeoJSON, markers, renderHtmlMarkers]);

  // HTML markers creation effect
  useEffect(() => {
    if (!renderHtmlMarkers) return;
    const map = mapRef.current;
    if (!map) return;

    const createHtmlMarkers = () => {
      // Cleanup existing markers
      iconMarkersRef.current.forEach(mk => mk.remove());
      labelMarkersRef.current.forEach(mk => mk.remove());
      iconMarkersRef.current = [];
      labelMarkersRef.current = [];

      if (!markers || markers.length === 0) {
        console.warn('HTML marker creation: no markers provided');
        return;
      }

      markers.forEach(m => {
        const [lat, lng] = m.position; // input [lat,lng]
        if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
          console.warn('Skipping marker with invalid position', m);
          return;
        }
        // Icon marker element
        const iconEl = document.createElement('div');
        iconEl.className = 'bf-marker-icon';
        iconEl.style.width = '32px';
        iconEl.style.height = '32px';
        if (m.iconUrl) {
          iconEl.style.backgroundImage = `url(${m.iconUrl})`;
          iconEl.style.backgroundSize = 'contain';
          iconEl.style.backgroundRepeat = 'no-repeat';
        } else {
          iconEl.style.background = '#ff5722';
        }
        iconEl.style.cursor = 'pointer';
        iconEl.dataset.id = m.id;
        iconEl.onclick = () => onMarkerClick && onMarkerClick(m.id);
        const iconMarker = new maplibregl.Marker({ element: iconEl, offset: iconOffset })
          .setLngLat([lng, lat])
          .addTo(map);
        iconMarkersRef.current.push(iconMarker);

        // Label marker element
        const labelEl = document.createElement('div');
        labelEl.className = 'bf-marker-label';
        labelEl.textContent = m.label || '';
        const labelMarker = new maplibregl.Marker({ element: labelEl, offset: labelOffset })
          .setLngLat([lng, lat])
          .addTo(map);
        labelMarkersRef.current.push(labelMarker);
      });
      console.log(`HTML markers created: ${iconMarkersRef.current.length}`);
    };

    if (map.isStyleLoaded()) {
      createHtmlMarkers();
    } else {
      map.once('load', createHtmlMarkers);
    }
  }, [markers, renderHtmlMarkers, iconOffset, labelOffset, onMarkerClick]);

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