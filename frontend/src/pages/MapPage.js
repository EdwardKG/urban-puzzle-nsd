import React, {useEffect, useState} from 'react';
import CustomStyledMapView from "../components/mapTiler/CustomStyledMapView";
import localIcon from '../data/icon.svg';
import data from '../data/brownfields_data.json';
import { parseWktPolygonCoordinates } from '../utils/wktParser';

const MY_CUSTOM_STYLE_URL = `https://api.maptiler.com/maps/019a1bc0-fc19-732b-bdd5-ad003bc606f4/style.json?key=g0AZaldfy32EOxnSpvMv`;

const TEST_BROWNFIELD_NAMES = [
  'Old Factory','Warehouse A','Rail Yard','Abandoned Mill','Former Depot','Storage Lot','Vacant Plant','Old Brewery','Unused Hangar','Dockside Parcel','Brick Works','Foundry Site','Lumber Yard','Coal Storage','Transit Hub','Processing Yard','Chemical Lot','Glassworks','Steel Shed','Machinery Hall','Paper Mill','Timber Depot','Freight Station','Industrial Park','Assembly Hall'
];

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

    const polygons = data.map((bf, idx) => {
      const testName = TEST_BROWNFIELD_NAMES[idx % TEST_BROWNFIELD_NAMES.length];
      const finalName = (bf.name && bf.name !== 'N/A') ? bf.name : testName;
      const points = bf.points && bf.points.length ? bf.points : (bf.shape ? parseWktPolygonCoordinates(bf.shape, { order: 'latlng' }) : []);
      return {
        id: bf.id,
        points,
        color: '#1f4d9b',
        fillColor: 'rgba(31,77,155,0.35)',
        properties: { ...bf, name: finalName },
      };
    });


    /*const parsed = parseAndReprojectBrownfields(rawBrownfields);
    const polygons = parsed.map((bf, idx) => {
      const testName = TEST_BROWNFIELD_NAMES[idx % TEST_BROWNFIELD_NAMES.length];
      const finalName = (bf.name && bf.name !== 'N/A') ? bf.name : testName;
      return {
        id: bf.id,
        points: bf.points,
        color: '#1f4d9b',
        fillColor: 'rgba(31,77,155,0.35)',
        properties: { ...bf, name: finalName },
      };
    });*/
    setBrownfields(polygons);

    const centroidMarkers = polygons.map(poly => {
      const c = computeCentroid(poly.points);
      if (!c) return null;
      return {
        id: `centroid-${poly.id}`,
        position: c,
        iconUrl: localIcon,
        iconName: 'local-centroid-icon',
        label: poly.properties.name,
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
        polygonFillColor="rgba(0,150,136,0.35)"
        polygonOutlineColor="#009688"
        patternType="none"
        patternForegroundColor="#004d40"
        patternBackgroundColor="rgba(0,150,136,0.1)"
      />
    </div>
  );
}
