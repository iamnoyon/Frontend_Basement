'use client';

/**
 * Renders ONLY Dhamrai Upazila (Dhaka District), split into its 16 unions + Dhamrai Paurashava:
 *  - each union is filled with its own color (hover for the name, legend in the corner)
 *  - click a union (on the map or in the legend) to zoom to it and show its wards, each in its own color;
 *    "Show all unions" zooms back out
 *  - everything outside the upazila is masked out
 *  - the view is zoomed to fit the upazila and locked so users can't pan away
 *
 * Data: loaded from the backend (GET /union/list and /ward/list, see store/publilc_map), which is seeded from
 * database/dhamrai_geo_seed.sql, generated from the two files below.
 *
 * Unions: public/geo/dhamrai-unions.geojson, extracted from the geoBoundaries BGD ADM4 dataset
 * (Bangladesh Bureau of Statistics / OCHA ROAP, CC BY 3.0 IGO):
 *   https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BGD/ADM4/geoBoundaries-BGD-ADM4_simplified.geojson
 *
 * Wards: public/geo/dhamrai-wards.geojson, extracted from the DGHS GIS ward layer (3 wards per union, no wards
 * for Dhamrai Paurashava), properties renamed to { union, ward, code }:
 *   https://gis.dghs.gov.bd/server/rest/services/Hosted/All_Wards_main/FeatureServer/0/query
 *     ?where=district='Dhaka' AND upazila='Dhamrai'&outFields=*&outSR=4326&f=geojson
 *
 * Load without SSR (Leaflet needs `window`):
 *   const DhamraiMap = dynamic(() => import('@/components/modules/map/DhamraiMap'), { ssr: false });
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGetUnionsCoverageQuery, useGetWardsCoverageQuery } from '@/store/publilc_map';

const RESULTS_URL = '/geo/dhamrai-ward-results.json'; // { candidates: [{id, name}], wards: { [code]: { totalVoters, votes: {[id]: n} } } }
// Election results are hidden for now; set to true to show vote labels on the map and breakdowns in the legend.
const SHOW_RESULTS = false;
const DHAMRAI_CENTER = [23.9167, 90.2]; // initial view only, before data loads
const WORLD_RING = [
  [-90, -180],
  [-90, 180],
  [90, 180],
  [90, -180],
];
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | ' +
  'Unions: BBS / OCHA via <a href="https://www.geoboundaries.org">geoBoundaries</a> (CC BY 3.0 IGO) | ' +
  'Wards: <a href="https://gis.dghs.gov.bd">DGHS</a>';

// One distinct color per item (union or ward), spread around the hue wheel.
function distinctColor(index, total) {
  const hue = Math.round((index * 360) / total);
  const lightness = index % 2 ? 62 : 48; // alternate so neighbours in the list differ more
  return `hsl(${hue}, 70%, ${lightness}%)`;
}

// Keep only polygon features.
function toPolygonCollection(raw) {
  const features = (raw?.features ?? []).filter((f) =>
    ['Polygon', 'MultiPolygon'].includes(f?.geometry?.type),
  );
  return features.length ? { type: 'FeatureCollection', features } : null;
}

// API rows -> the GeoJSON FeatureCollections the map works with.
// /union/list: [{ id, name, is_paurashava, geometry }]
function unionsToCollection(rows) {
  if (!Array.isArray(rows)) return null;
  return toPolygonCollection({
    features: rows.map(({ id, name, is_paurashava, geometry }) => ({
      type: 'Feature',
      properties: { id, name, is_paurashava },
      geometry,
    })),
  });
}

// /ward/list: [{ id, union_id, ward_no, code, geometry }]; the union is matched to /union/list by id.
function wardsToCollection(rows, unionRows) {
  if (!Array.isArray(rows)) return null;
  const unionNameById = Object.fromEntries((unionRows ?? []).map((u) => [u.id, u.name]));
  return toPolygonCollection({
    features: rows.map((row) => ({
      type: 'Feature',
      properties: {
        union: row.union_name ?? unionNameById[row.union_id],
        ward: row.ward_no,
        code: row.code,
      },
      geometry: row.geometry,
    })),
  });
}

const wardLabel = (feature) => `${feature.properties.union} – Ward ${feature.properties.ward}`;

const formatNumber = (n) => n.toLocaleString('en-US');
const percent = (part, whole) => (whole ? `${((part / whole) * 100).toFixed(1)}%` : '–');

// Per-candidate votes, turnout and leader for one ward; null when the ward has no result entry.
function summarizeWard(results, code) {
  const entry = results?.wards?.[code];
  return entry ? summarizeEntry(entry, results.candidates) : null;
}

// Same summary for a whole union, adding up its wards; null when none of its wards have results.
function summarizeUnion(results, wards, unionName) {
  const entries = (wards?.features ?? [])
    .filter((f) => f.properties.union === unionName)
    .map((f) => results?.wards?.[f.properties.code])
    .filter(Boolean);
  if (!entries.length) return null;

  const total = { totalVoters: 0, votes: {} };
  entries.forEach((entry) => {
    total.totalVoters += entry.totalVoters ?? 0;
    results.candidates.forEach(({ id }) => {
      total.votes[id] = (total.votes[id] ?? 0) + (entry.votes?.[id] ?? 0);
    });
  });
  return summarizeEntry(total, results.candidates);
}

function summarizeEntry(entry, candidates) {
  const rows = candidates.map(({ id, name }) => ({ id, name, votes: entry.votes?.[id] ?? 0 }));
  const totalVotes = rows.reduce((sum, row) => sum + row.votes, 0);
  const sorted = [...rows].sort((a, b) => b.votes - a.votes);
  const leader = sorted[0] && sorted[0].votes > (sorted[1]?.votes ?? 0) ? sorted[0] : null; // no leader on a tie

  return {
    rows: rows.map((row) => ({ ...row, pct: percent(row.votes, totalVotes) })),
    totalVotes,
    totalVoters: entry.totalVoters,
    turnout: percent(totalVotes, entry.totalVoters),
    leader,
    invalid: totalVotes > entry.totalVoters,
  };
}

// Short candidate tag for map labels: "Candidate A" -> "A", "Rahim Uddin" -> "RU".
const initials = (name) =>
  name.startsWith('Candidate ') ? name.slice(10) : name.split(/\s+/).map((w) => w[0]).join('').toUpperCase();

const resultLabelHtml = (title, summary) =>
  `<strong>${title}</strong><br>${summary.rows.map((r) => `${initials(r.name)} ${formatNumber(r.votes)}`).join(' · ')}`;

// Candidate votes, total voters, turnout and leader, as shown in the legend for a ward or a union.
function ResultBreakdown({ summary }) {
  if (!summary) return <div className="ml-5 italic text-gray-500">No results</div>;

  return (
    <div className="ml-5 mt-0.5 space-y-0.5 text-[11px] font-normal text-gray-600">
      {summary.rows.map((row) => (
        <div
          key={row.id}
          className={`flex justify-between gap-3 ${summary.leader?.id === row.id ? 'font-semibold text-gray-900' : ''}`}
        >
          <span>{row.name}</span>
          <span>
            {formatNumber(row.votes)} ({row.pct})
          </span>
        </div>
      ))}
      <div className="flex justify-between gap-3 border-t border-gray-200 pt-0.5">
        <span>Total voters</span>
        <span>{formatNumber(summary.totalVoters)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span>Turnout</span>
        <span>{summary.turnout}</span>
      </div>
      {summary.invalid && <div className="font-medium text-red-600">Votes exceed total voters</div>}
    </div>
  );
}

// Outer rings of every polygon, converted from GeoJSON [lng, lat] to Leaflet [lat, lng].
function getOuterRings(collection) {
  const rings = [];
  collection.features.forEach(({ geometry }) => {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    polygons.forEach((poly) => rings.push(poly[0].map(([lng, lat]) => [lat, lng])));
  });
  return rings;
}

// Locks panning/zooming-out to the upazila, and fits the view to the selected union (or the whole upazila).
function LockToBoundary({ collection, selectedFeature }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.geoJSON(collection).getBounds();
    if (!bounds.isValid()) return;

    map.setMinZoom(map.getBoundsZoom(bounds, false, L.point(16, 16)));
    map.setMaxBounds(bounds.pad(0.1));
  }, [collection, map]);

  // Jump straight to the upazila on first load, animate every later change.
  const hasFitted = useRef(false);
  useEffect(() => {
    const bounds = L.geoJSON(selectedFeature ?? collection).getBounds();
    if (!bounds.isValid()) return;

    map.fitBounds(bounds, { padding: [24, 24], animate: hasFitted.current });
    hasFitted.current = true;
  }, [collection, selectedFeature, map]);

  return null;
}

export default function DhamraiMap({ className = '' }) {
  const [results, setResults] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  const { data: unionRows, error: unionsError, isSuccess: unionsLoaded } = useGetUnionsCoverageQuery();
  // Wards are optional: if they fail to load, selecting a union just zooms to it.
  const { data: wardRows } = useGetWardsCoverageQuery();

  const collection = useMemo(() => unionsToCollection(unionRows), [unionRows]);
  const wards = useMemo(() => wardsToCollection(wardRows, unionRows), [wardRows, unionRows]);

  let error = null;
  if (unionsError) error = `Failed to load unions (${unionsError.status})`;
  else if (unionsLoaded && !collection) error = 'No union boundaries returned by the server';

  useEffect(() => {
    if (!SHOW_RESULTS) return undefined;
    const controller = new AbortController();

    // Election results are optional too: without them wards just show their names.
    fetch(RESULTS_URL, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => setResults(Array.isArray(raw?.candidates) ? raw : null))
      .catch(() => {});

    return () => controller.abort();
  }, []);

  // World rectangle with every union cut out -> hides everything outside the upazila.
  const maskPositions = useMemo(
    () => (collection ? [WORLD_RING, ...getOuterRings(collection)] : null),
    [collection],
  );

  const colorByName = useMemo(() => {
    const names = collection?.features.map((f) => f.properties.name) ?? [];
    return Object.fromEntries(names.map((name, i) => [name, distinctColor(i, names.length)]));
  }, [collection]);

  const selectedFeature = useMemo(
    () => collection?.features.find((f) => f.properties.name === selectedName) ?? null,
    [collection, selectedName],
  );

  const selectedWards = useMemo(() => {
    const features = wards?.features.filter((f) => f.properties.union === selectedName) ?? [];
    return features.length ? { type: 'FeatureCollection', features } : null;
  }, [wards, selectedName]);

  const colorByWard = useMemo(() => {
    const features = selectedWards?.features ?? [];
    return new Map(features.map((f, i) => [f, distinctColor(i, features.length)]));
  }, [selectedWards]);

  // A new function per selection makes react-leaflet re-apply styles to every union.
  const styleUnion = useCallback(
    (feature) => {
      const isSelected = feature.properties.name === selectedName;
      return {
        color: '#ffffff',
        weight: isSelected ? 3 : 1.5,
        fillColor: colorByName[feature.properties.name],
        // The selected union's fill comes from its wards when they're shown.
        fillOpacity: !selectedName ? 0.55 : isSelected ? (selectedWards ? 0 : 0.7) : 0.15,
      };
    },
    [colorByName, selectedName, selectedWards],
  );

  const styleWard = useCallback(
    (feature) => ({ color: '#ffffff', weight: 1.5, fillColor: colorByWard.get(feature), fillOpacity: 0.7 }),
    [colorByWard],
  );

  // Layer handlers are bound once, so they read the current style through a ref.
  const styleRef = useRef(styleUnion);
  useEffect(() => {
    styleRef.current = styleUnion;
  }, [styleUnion]);

  // Union totals (sum of their wards), used for the overview labels and legend.
  const unionSummaries = useMemo(
    () =>
      Object.fromEntries(
        (collection?.features ?? []).map((f) => [f.properties.name, summarizeUnion(results, wards, f.properties.name)]),
      ),
    [collection, results, wards],
  );

  // Tooltips are set here rather than in bindUnion so they follow the selection without re-creating the layer:
  // in the overview each union with results gets a permanent totals label, otherwise just its name on hover.
  const unionLayerRef = useRef(null);
  useEffect(() => {
    unionLayerRef.current?.eachLayer((layer) => {
      const { name } = layer.feature.properties;
      const summary = unionSummaries[name];
      layer.unbindTooltip();
      if (!selectedName && summary) {
        layer.bindTooltip(resultLabelHtml(name, summary), {
          permanent: true,
          direction: 'center',
          className: 'ward-result-label',
        });
      } else {
        layer.bindTooltip(name, { sticky: true });
      }
    });
  }, [unionSummaries, selectedName, collection]);

  const bindUnion = (feature, layer) => {
    layer.on({
      click: () => setSelectedName(feature.properties.name),
      mouseover: () => layer.setStyle({ weight: 3, fillOpacity: 0.75 }),
      mouseout: () => layer.setStyle(styleRef.current(feature)),
    });
  };

  // Ward layers are recreated per union and when results load (see `key` below), so nothing here is stale.
  const bindWard = (feature, layer) => {
    const summary = summarizeWard(results, feature.properties.code);
    if (summary) {
      layer.bindTooltip(resultLabelHtml(`Ward ${feature.properties.ward}`, summary), {
        permanent: true,
        direction: 'center',
        className: 'ward-result-label',
      });
    } else {
      layer.bindTooltip(wardLabel(feature), { sticky: true });
    }
    layer.on({
      mouseover: () => layer.setStyle({ weight: 3, fillOpacity: 0.85 }),
      mouseout: () => layer.setStyle(styleWard(feature)),
    });
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-gray-100 ${className}`}
    >
      {error && (
        <div className="absolute left-3 top-3 z-[1000] rounded bg-red-50 px-3 py-2 text-sm text-red-700 shadow">
          {error}
        </div>
      )}

      {collection && (
        <div
          className={`absolute right-3 top-3 z-[1000] flex max-h-[calc(100%-24px)] flex-col rounded bg-white/90 py-2 text-xs text-gray-700 shadow ${
            results ? 'w-64' : ''
          }`}
        >
          {selectedName && (
            <button
              type="button"
              onClick={() => setSelectedName(null)}
              className="mx-2 mb-2 rounded border border-gray-300 bg-white px-2 py-1 font-medium hover:bg-gray-50"
            >
              Show all unions
            </button>
          )}
          <ul className="space-y-0.5 overflow-y-auto px-2">
            {Object.entries(colorByName).map(([name, color]) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => setSelectedName(name)}
                  aria-pressed={name === selectedName}
                  className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-gray-100 ${
                    name === selectedName ? 'bg-gray-100 font-semibold' : ''
                  }`}
                >
                  <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
                  {name}
                </button>

                {!selectedName && results && <ResultBreakdown summary={unionSummaries[name]} />}

                {name === selectedName && (
                  <ul className="mb-1 ml-5 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
                    {selectedWards ? (
                      selectedWards.features.map((ward) => {
                        const summary = summarizeWard(results, ward.properties.code);
                        return (
                          <li key={ward.properties.code} className="py-0.5">
                            <div className="flex items-center gap-2 font-medium">
                              <span
                                className="h-3 w-3 shrink-0 rounded-sm"
                                style={{ backgroundColor: colorByWard.get(ward) }}
                              />
                              Ward {ward.properties.ward}
                            </div>
                            {results && <ResultBreakdown summary={summary} />}
                          </li>
                        );
                      })
                    ) : (
                      <li className="py-0.5 italic text-gray-500">No ward boundaries available</li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <MapContainer
        center={DHAMRAI_CENTER}
        zoom={11}
        maxBoundsViscosity={1}
        className="h-full w-full bg-gray-100"
      >
        {collection && (
          <>
            <TileLayer attribution={ATTRIBUTION} url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Polygon
              positions={maskPositions}
              interactive={false}
              pathOptions={{ stroke: false, fillColor: '#f3f4f6', fillOpacity: 1 }}
            />

            <GeoJSON ref={unionLayerRef} data={collection} style={styleUnion} onEachFeature={bindUnion} />

            {selectedWards && (
              <GeoJSON
                key={`${selectedName}-${results ? 'results' : 'plain'}`}
                data={selectedWards} style={styleWard} onEachFeature={bindWard} />
            )}

            <LockToBoundary collection={collection} selectedFeature={selectedFeature} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
