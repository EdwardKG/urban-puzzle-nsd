/**
 * Parse a WKT POLYGON string and return an array of coordinates.
 * Supports only outer ring of POLYGON; MULTIPOLYGON / holes ignored for simplicity.
 *
 * Example input:
 *   'POLYGON ((17.116622925477003 48.15349055597032, 17.116695531272633 48.15346067621143, 17.116712475899565 48.15345314707334))'
 *
 * @param {string} wkt - WKT polygon string.
 * @param {Object} [options]
 * @param {('latlng'|'lnglat')} [options.order='lnglat'] - Output order of each coordinate pair.
 * @param {boolean} [options.dedupe=true] - Remove duplicate last point if identical to first.
 * @returns {Array<Array<number>>} Array of coordinate pairs.
 */
export function parseWktPolygonCoordinates(wkt, options = {}) {
  const { order = 'lnglat', dedupe = true } = options;
  if (typeof wkt !== 'string') throw new TypeError('WKT must be a string');
  const trimmed = wkt.trim();
  if (!/^POLYGON\s*\(/i.test(trimmed)) throw new Error('Input does not start with POLYGON');

  // Extract the content inside the outer double parentheses (( ... ))
  const start = trimmed.indexOf('((');
  const end = trimmed.lastIndexOf('))');
  if (start === -1 || end === -1 || end <= start + 2) throw new Error('Invalid POLYGON WKT format');
  const inner = trimmed.slice(start + 2, end).trim();

  // Only take first ring (ignore holes separated by '), (')
  const firstRing = inner.split('),').shift();

  const pairs = firstRing.split(',').map(seg => seg.trim()).filter(Boolean);
  const coords = [];
  for (const pair of pairs) {
    // Handle multiple spaces
    const parts = pair.split(/\s+/).filter(Boolean);
    if (parts.length < 2) continue; // skip malformed
    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (Number.isNaN(lng) || Number.isNaN(lat)) {
      throw new Error(`Invalid numeric coordinate in segment: ${pair}`);
    }
    coords.push(order === 'latlng' ? [lat, lng] : [lng, lat]);
  }
  if (dedupe && coords.length > 1) {
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] === last[0] && first[1] === last[1]) coords.pop();
  }
  return coords;
}

/**
 * Try parsing; return empty array on failure (safe version).
 * @param {string} wkt
 * @param {Object} options
 * @returns {Array<Array<number>>}
 */
export function safeParseWktPolygon(wkt, options = {}) {
  try {
    return parseWktPolygonCoordinates(wkt, options);
  } catch (e) {
    console.warn('safeParseWktPolygon failed:', e.message);
    return [];
  }
}

// Quick inline test (can be removed in production)
// if (typeof window !== 'undefined') {
//   const test = 'POLYGON ((17.116622925477003 48.15349055597032, 17.116695531272633 48.15346067621143, 17.116712475899565 48.15345314707334, 17.116622925477003 48.15349055597032))';
//   console.log('parseWktPolygonCoordinates latlng:', parseWktPolygonCoordinates(test, { order: 'latlng' }));
// }

