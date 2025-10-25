import React, {useEffect, useState} from 'react';
import CustomStyledMapView from "../components/mapTiler/CustomStyledMapView";
import {parseAndReprojectBrownfields} from "../utils/brownfieldParser";
import rawBrownfields from '../data/brownfield.json';

const MY_CUSTOM_STYLE_URL = `https://api.maptiler.com/maps/019a1bc0-fc19-732b-bdd5-ad003bc606f4/style.json?key=g0AZaldfy32EOxnSpvMv`;

export default function MapPage() {
  const [center] = useState([48.1486, 17.1077]);
  const [zoom] = useState(15);
  const [brownfields, setBrownfields] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Compute centroid from polygon points (array of [lat,lng])
  const computeCentroid = (points) => {
    if (!points || points.length === 0) return null;
    // Simple average centroid (adequate for small footprints)
    const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    return [sum[0] / points.length, sum[1] / points.length];
  };

  useEffect(() => {
    const parsed = parseAndReprojectBrownfields(rawBrownfields);
    const polygons = parsed.map(bf => ({
      id: bf.id,
      points: bf.points, // full geometry
      color: '#1f4d9b',
      fillColor: 'rgba(31,77,155,0.35)',
      properties: bf,
    }));
    setBrownfields(polygons);

    const centroidMarkers = polygons.map(poly => {
      const c = computeCentroid(poly.points);
      if (!c) return null;
      return {
        id: `centroid-${poly.id}`,
        position: c,
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png', // generic location pin
        iconName: 'centroid-pin',
        label: '',
      };
    }).filter(Boolean);
    setMarkers(centroidMarkers);
    setLoading(false);
  }, []);

  const handleMarkerClick = (id) => {
    const polyId = id.replace('centroid-', '');
    const poly = brownfields.find(p => p.id === polyId);
    if (poly) {
      console.log('Centroid marker clicked for brownfield:', poly.properties);
    } else {
      console.log('Marker clicked:', id);
    }
  };

  if (loading) return <div>Loading brownfield data…</div>;

  return (
    <div className='map-page' style={{ margin: 0, padding: 0 }}>
      <CustomStyledMapView
        mapStyleUrl={MY_CUSTOM_STYLE_URL}
        center={center}
        zoom={zoom}
        polygons={brownfields}
        markers={markers}
        onMarkerClick={handleMarkerClick}
        useViewportHeight
        maxHeightOffset={0}
        hideMapBorders
        showPolygonOutline={false}
        containerBorderRadius={0}
        height="100vh"
        width="100vw"
      />
    </div>
  );
}
