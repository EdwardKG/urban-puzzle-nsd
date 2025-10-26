import React, { useMemo, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './markers.css';

// Convert app polygons (points as [lat, lng]) to proper GeoJSON (coordinates [lng, lat])
// Extend toGeoJSON to support dynamic style properties via getPolygonStyle
const toGeoJSON = (polygons, getPolygonStyle) => {
  const features = polygons.map(p => {
    const ring = p.points.map(([lat, lng]) => [lng, lat]);
    if (ring.length > 0) {
      // Ensure ring closed
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);
    }
    const style = getPolygonStyle ? getPolygonStyle(p) : {};
    return {
      type: 'Feature',
      properties: {
        id: p.id,
        color: style.outlineColor || p.color || '#1f4d9b',
        fillColor: style.fillColor || p.fillColor || 'rgba(31,77,155,0.4)',
        fillOpacity: style.fillOpacity != null ? style.fillOpacity : 0.4,
        outlineWidth: style.outlineWidth != null ? style.outlineWidth : 2,
        outlineDashArray: style.outlineDashArray || null,
        patternName: style.patternName || null,
      },
      geometry: { type: 'Polygon', coordinates: [ring] },
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
  getPolygonStyle, // NEW: function (polygon) => style object
  enableHoverHighlight = true, // NEW: highlight polygon on hover
  hoverHighlightStyles = { fillOpacity: 0.7, outlineWidth: 3, outlineColor: '#ff9800' }, // NEW
  useCssVariables = false, // NEW: read CSS vars for default fill/outline
  fillPatternImage, // NEW: static pattern image (existing prop)
  polygonFillColor, // NEW: override all polygon fill colors
  polygonOutlineColor, // NEW: override all polygon outline colors
  patternType = 'none', // NEW: 'none' | 'diagonal' | 'dots' | 'cross'
  patternForegroundColor = '#000000', // NEW pattern foreground
  patternBackgroundColor = 'rgba(0,0,0,0)', // NEW pattern background
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const iconMarkersRef = useRef([]); // track icon markers for cleanup
  const labelMarkersRef = useRef([]); // track label markers for cleanup
  const htmlMarkersInitializedRef = useRef(false);
  const hoveredIdRef = useRef(null);

  // Helper to read CSS variables if requested
  const cssVars = useMemo(() => {
    if (!useCssVariables || typeof window === 'undefined') return {};
    const styles = getComputedStyle(document.documentElement);
    return {
      fillColorVar: styles.getPropertyValue('--map-polygon-fill').trim() || null,
      outlineColorVar: styles.getPropertyValue('--map-polygon-stroke').trim() || null,
    };
  }, [useCssVariables]);

  // Pattern generator helper (16x16 tile)
  const generatePatternCanvas = (type, fg, bg) => {
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0,0,size,size);
    ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.lineWidth = 2;
    if (type === 'diagonal') {
      for (let offset=-size; offset<=size; offset+=6) {
        ctx.beginPath(); ctx.moveTo(offset, size); ctx.lineTo(offset+size, 0); ctx.stroke();
      }
    } else if (type === 'dots') {
      for (let y=2; y<size; y+=6) {
        for (let x=2; x<size; x+=6) { ctx.beginPath(); ctx.arc(x,y,1.8,0,Math.PI*2); ctx.fill(); }
      }
    } else if (type === 'cross') {
      ctx.beginPath(); ctx.moveTo(0,size/2); ctx.lineTo(size,size/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(size/2,0); ctx.lineTo(size/2,size); ctx.stroke();
    }
    return canvas;
  };

  // Build GeoJSON with dynamic styles
  const polygonGeoJSON = useMemo(() => toGeoJSON(
    polygons.map(p => ({
      ...p,
      fillColor: cssVars.fillColorVar || polygonFillColor || p.fillColor,
      color: cssVars.outlineColorVar || polygonOutlineColor || p.color,
    })),
    getPolygonStyle
  ), [polygons, getPolygonStyle, cssVars, polygonFillColor, polygonOutlineColor]);

  // Helper: convert markers (lat,lng) to GeoJSON Points (lng,lat)
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
      // Dynamic pattern generation (if requested)
      let dynamicPatternName = null;
      if (patternType !== 'none') {
        const tile = generatePatternCanvas(patternType, patternForegroundColor, patternBackgroundColor);
        const dataUrl = tile.toDataURL();
        mapRef.current.loadImage(dataUrl, (err, image) => {
          if (!err && image && !mapRef.current.hasImage('dynamic-pattern')) {
            mapRef.current.addImage('dynamic-pattern', image, { pixelRatio: 2 });
          }
        });
        dynamicPatternName = 'dynamic-pattern';
      }
      // Static pattern image (fallback / alternative)
      if (fillPatternImage) {
        mapRef.current.loadImage(fillPatternImage, (err, image) => {
          if (!err && image && !mapRef.current.hasImage('polygon-pattern')) {
            mapRef.current.addImage('polygon-pattern', image, { pixelRatio: 2 });
          }
        });
      }
      // Add source for polygons
      if (!mapRef.current.getSource('custom-polygons')) {
        const sourceData = (dynamicPatternName || fillPatternImage) ? {
          ...polygonGeoJSON,
          features: polygonGeoJSON.features.map(f => ({
            ...f,
            properties: { ...f.properties, patternName: dynamicPatternName || 'polygon-pattern' }
          }))
        } : polygonGeoJSON;
        mapRef.current.addSource('custom-polygons', { type: 'geojson', data: sourceData });
      }
      // Fill layer with feature-state based hover styling
      if (!mapRef.current.getLayer('custom-polygons-fill')) {
        mapRef.current.addLayer({
          id: 'custom-polygons-fill',
          type: 'fill',
          source: 'custom-polygons',
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': [
              'case', ['boolean', ['feature-state', 'hover'], false],
              hoverHighlightStyles.fillOpacity,
              ['get', 'fillOpacity']
            ],
            ...((patternType !== 'none' || fillPatternImage) ? { 'fill-pattern': ['get', 'patternName'] } : {})
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
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              hoverHighlightStyles.outlineColor,
              ['get', 'color']
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              hoverHighlightStyles.outlineWidth,
              ['get', 'outlineWidth']
            ],
            ...(polygons.some(p => p.outlineDashArray) ? { 'line-dasharray': ['get', 'outlineDashArray'] } : {})
          },
        });
      }
      // Hover interactions
      if (enableHoverHighlight) {
        mapRef.current.on('mousemove', 'custom-polygons-fill', e => {
          const features = e.features;
          const newId = features && features[0] ? features[0].properties.id : null;
          if (hoveredIdRef.current && hoveredIdRef.current !== newId) {
            mapRef.current.setFeatureState({ source: 'custom-polygons', id: hoveredIdRef.current }, { hover: false });
          }
          if (newId && hoveredIdRef.current !== newId) {
            hoveredIdRef.current = newId;
            mapRef.current.setFeatureState({ source: 'custom-polygons', id: newId }, { hover: true });
          }
        });
        mapRef.current.on('mouseleave', 'custom-polygons-fill', () => {
          if (hoveredIdRef.current) {
            mapRef.current.setFeatureState({ source: 'custom-polygons', id: hoveredIdRef.current }, { hover: false });
            hoveredIdRef.current = null;
          }
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
  }, [mapStyleUrl, center, zoom, polygonGeoJSON, markerGeoJSON, onMarkerClick, renderHtmlMarkers, enableHoverHighlight, hoverHighlightStyles, fillPatternImage, patternType, patternForegroundColor, patternBackgroundColor]);

  // Update center / zoom when props change
  useEffect(() => {
    if (!mapRef.current) return;
    const [lat, lng] = center;
    mapRef.current.setCenter([lng, lat]);
    mapRef.current.setZoom(zoom);
  }, [center, zoom]);

  // Update polygon data when polygons change (ensure feature id inclusion for feature-state)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) {
      const src = map.getSource('custom-polygons');
      if (src) src.setData(polygonGeoJSON);
    } else {
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