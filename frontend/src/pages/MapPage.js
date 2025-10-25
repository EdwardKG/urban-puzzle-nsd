import React, { useState } from 'react';
import CustomStyledMapView from "../components/mapTiler/CustomStyledMapView";

const MAPTILER_KEY = 'g0AZaldfy32EOxnSpvMv';
const MY_CUSTOM_STYLE_URL = `https://api.maptiler.com/maps/019a1bc0-fc19-732b-bdd5-ad003bc606f4/style.json?key=g0AZaldfy32EOxnSpvMv`;
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
    <div className='map-page' style={{ margin: 0, padding: 0 }}> {/* remove all spacing */}
      <CustomStyledMapView
          mapStyleUrl={MY_CUSTOM_STYLE_URL}
          center={center}
          zoom={zoom}
          polygons={polygons}
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
