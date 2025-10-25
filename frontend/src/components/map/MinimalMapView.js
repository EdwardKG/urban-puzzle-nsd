import React from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// A helper component to programmatically update the map's view
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// --- Configuration for all our map styles ---
const tileLayers = {
  // --- LIGHT ---
  cartoLight: {
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // --- DARK ---
  cartoDark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  stamenToner: {
    url: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // --- TERRAIN & TOPOGRAPHY ---
  openTopoMap: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  },
  stamenTerrain: {
    url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // --- SATELLITE ---
  esriWorldImagery: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },

  // --- MINIMAL & SPECIALIZED ---
  stamenTonerLite: {
    url: 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  humanitarian: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
  },

  // --- ARTISTIC ---
  stamenWatercolor: {
    url: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // --- MULTI-LAYER (Example) ---
  // This shows how to combine layers, e.g., a base map with labels on top
  satelliteWithLabels: [
    {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri',
    },
    {
      url: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  ],
};

// Define the type for our tileVariant prop for better autocompletion and type-safety
/**
 * @typedef {'cartoLight' | 'osm' | 'cartoDark' | 'stamenToner' | 'openTopoMap' | 'stamenTerrain' | 'esriWorldImagery' | 'stamenTonerLite' | 'humanitarian' | 'stamenWatercolor' | 'satelliteWithLabels'} TileVariant
 */

/**
 * @param {{
 *  center?: [number, number],
 *  zoom?: number,
 *  polygons?: Array<{id: string, points: Array<[number, number]>, color?: string, fillColor?: string}>,
 *  height?: string,
 *  width?: string,
 *  scrollWheelZoom?: boolean,
 *  tileVariant?: TileVariant
 * }} props
 */
export default function MinimalMapView({
                                         center = [48.1486, 17.1077],
                                         zoom = 15,
                                         polygons = [],
                                         height = '600px',
                                         width = '100%',
                                         scrollWheelZoom = true,
                                         tileVariant = 'cartoLight', // Default to a clean, light map
                                       }) {
  const selectedLayer = tileLayers[tileVariant] || tileLayers.cartoLight;

  const renderTileLayers = () => {
    if (Array.isArray(selectedLayer)) {
      // Handle multi-layer variants
      return selectedLayer.map((layer, index) => (
          <TileLayer key={index} url={layer.url} attribution={layer.attribution} />
      ));
    }
    // Handle single-layer variants
    return <TileLayer url={selectedLayer.url} attribution={selectedLayer.attribution} />;
  };

  return (
      <div style={{ width, height }}>
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={scrollWheelZoom}
            style={{ width: '100%', height: '100%', background: '#fff' }}
        >
          {renderTileLayers()}
          <ChangeView center={center} zoom={zoom} />
          {polygons.map(p => (
              <Polygon
                  key={p.id}
                  positions={p.points}
                  pathOptions={{
                    color: p.color || '#1f4d9b',
                    weight: 2,
                    fillColor: p.fillColor || 'rgba(31,77,155,0.4)',
                    fillOpacity: 0.4,
                  }}
              />
          ))}
        </MapContainer>
      </div>
  );
}