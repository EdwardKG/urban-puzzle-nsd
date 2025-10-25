import proj4 from 'proj4';

// Define the coordinate systems.
// We get the "proj string" for EPSG:5514 from https://epsg.io/5514
const sJtskProjection = '+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813975277778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs +type=crs';
const wgs84Projection = 'EPSG:4326'; // Standard Latitude/Longitude

/**
 * Parses GeoJSON data for brownfields, reprojects coordinates, and cleans up properties.
 * Supports input as FeatureCollection or GeometryCollection.
 * @param {object} geoJsonData The raw GeoJSON data from the converted shapefile.
 * @returns {Array<object>} An array of cleaned brownfield objects for the map.
 */
export function parseAndReprojectBrownfields(geoJsonData) {
    // Normalize GeometryCollection into FeatureCollection if needed
    if (geoJsonData && !geoJsonData.features && geoJsonData.type === 'GeometryCollection' && Array.isArray(geoJsonData.geometries)) {
        geoJsonData = {
            type: 'FeatureCollection',
            features: geoJsonData.geometries.map((g, i) => ({
                type: 'Feature',
                properties: { SPEC_CISLO: `geom-${i}` },
                geometry: g,
            }))
        };
    }

    if (!geoJsonData || !geoJsonData.features) {
        console.error('Invalid GeoJSON data provided to parser.');
        return [];
    }

    // Create a transformation function from S-JTSK to WGS84
    const transform = proj4(sJtskProjection, wgs84Projection).forward;

    const parsedBrownfields = geoJsonData.features.map(feature => {
        const properties = feature.properties || {};
        const geometry = feature.geometry;

        if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates || geometry.coordinates.length === 0) {
            return null;
        }

        // Reproject each point in the polygon's outer ring.
        // Shapefiles give coordinates as [X, Y]. After proj4 forward transform we get [lon, lat].
        const reprojectedPoints = geometry.coordinates[0].map(point => {
            const [x, y] = point;
            const [lon, lat] = transform([x, y]);
            return [lat, lon]; // invert to have correct [lat, lon] order
        });

        return {
            id: properties.SPEC_CISLO || `bf-${Math.random().toString(36).slice(2, 9)}`,
            points: reprojectedPoints,
            name: properties.NAZOV || 'N/A',
            address: properties.ADRESA || 'N/A',
            cityPart: properties.MC || 'N/A',
            area: properties.VYMERA || 0,
            ownership: properties.DRUH_VLA || 'N/A',
            currentUse: properties.S_VYUZITIE || 'N/A',
            environmentalBurden: properties.SEZ_POPIS || 'N/A',
            urbanPlanFunction: properties.N_FUNK_POP || 'N/A',
            lastUpdate: properties.AKTUALIZAC || 'N/A',
        };
    }).filter(Boolean);

    return parsedBrownfields;
}