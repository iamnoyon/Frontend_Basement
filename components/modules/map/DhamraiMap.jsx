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
import { ChevronDown, List, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import {
  useGetFeaturesDropdownQuery,
  useGetResultByFeatureIdQuery,
  useGetUnionsCoverageQuery,
  useGetWardsCoverageQuery,
} from '@/store/publilc_map';

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

const formatNumber = (n) => (Number(n) || 0).toLocaleString('en-US');

// A ward's voter count; the API may send it as totalVoters or total_voter, or leave it out.
const entryVoters = (entry) => Number(entry?.totalVoters ?? entry?.total_voter) || 0;
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
    total.totalVoters += entryVoters(entry);
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
  const totalVoters = entryVoters(entry);

  return {
    rows: rows.map((row) => ({ ...row, pct: percent(row.votes, totalVotes) })),
    totalVotes,
    totalVoters,
    turnout: percent(totalVotes, totalVoters),
    leader,
    invalid: totalVoters > 0 && totalVotes > totalVoters, // unknown voter count isn't flagged as invalid
  };
}

// Short candidate tag for map labels: "Candidate A" -> "A", "Rahim Uddin" -> "RU".
const initials = (name) =>
  name.startsWith('Candidate ') ? name.slice(10) : name.split(/\s+/).map((w) => w[0]).join('').toUpperCase();

const resultLabelHtml = (title, summary) =>
  `<strong>${title}</strong><br>${summary.rows.map((r) => `${initials(r.name)} ${formatNumber(r.votes)}`).join(' · ')}`;

// Candidate votes, total voters, turnout and leader, as shown in the legend for a ward or a union.
function ResultBreakdown({ summary, images }) {
  if (!summary) return <div className="ml-5 italic text-gray-500">No results</div>;

  return (
    <div className="ml-5 mt-0.5 space-y-0.5 text-[11px] font-normal text-gray-600">
      {summary.rows.map((row) => (
        <div
          key={row.id}
          className={`flex justify-between gap-3 ${summary.leader?.id === row.id ? 'font-semibold text-gray-900' : ''}`}
        >
          <span className="flex items-center gap-1">
            {images?.[row.id] && (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary candidate image URLs from the API
              <img src={images[row.id]} alt="" className="h-4 w-4 shrink-0 rounded-full object-cover" />
            )}
            {row.name}
          </span>
          <span>
            {formatNumber(row.votes)} ({row.pct})
          </span>
        </div>
      ))}
      <div className="flex justify-between gap-3 border-t border-gray-200 pt-0.5">
        <span>Total Number</span>
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

// Election picker. A custom listbox rather than <select>, because phones open native selects in a system picker
// whose text size and width can't be styled; this keeps the options as compact as the button on small screens.
function ElectionSelect({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((o) => o.id === value);

  // Close on a tap/click outside or on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (id) => {
    setOpen(false);
    if (id !== value) onChange(id);
  };

  const items = [{ id: null, title: 'Select election' }, ...options];

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Election"
        className="flex h-9 w-full items-center gap-1 rounded border border-gray-300 bg-white pl-2 pr-1 text-left text-[13px] text-gray-800 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
      >
        <span className={`min-w-0 flex-1 truncate ${selected ? '' : 'text-gray-500'}`}>
          {selected?.title ?? 'Select election'}
        </span>
        <ChevronDown size={14} className={`shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Election"
          className="absolute left-0 top-full mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-200 bg-white py-1 text-[13px] shadow-lg sm:text-sm"
        >
          {items.map((item) => {
            const isSelected = item.id === (value ?? null);
            return (
              <li key={item.id ?? 'none'} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => choose(item.id)}
                  className={`w-full px-2 py-1.5 text-left hover:bg-gray-100 ${
                    isSelected ? 'bg-blue-50 font-medium text-blue-700' : item.id == null ? 'text-gray-500' : 'text-gray-800'
                  }`}
                >
                  {item.title}
                </button>
              </li>
            );
          })}
        </ul>
      )}
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
  const [selectedName, setSelectedName] = useState(null);
  // Legend panel on phones: hidden by default, toggled with the button in the top-right (always shown from `sm` up).
  const [panelOpen, setPanelOpen] = useState(false);

  const { data: unionRows, error: unionsError, isSuccess: unionsLoaded } = useGetUnionsCoverageQuery();
  // Wards are optional: if they fail to load, selecting a union just zooms to it.
  const { data: wardRows } = useGetWardsCoverageQuery();

  const collection = useMemo(() => unionsToCollection(unionRows), [unionRows]);
  const wards = useMemo(() => wardsToCollection(wardRows, unionRows), [wardRows, unionRows]);

  let error = null;
  if (unionsError) error = `Failed to load unions (${unionsError.status})`;
  else if (unionsLoaded && !collection) error = 'No union boundaries returned by the server';

  // Election results are optional too: without them wards just show their names.
  // Shape: { feature_id, title, union_id, candidates: [{id, name, image}], wards: { [code]: { totalVoters, votes: {[id]: n} } } }
  // Elections to pick from: { data: [{ id, title }] }. If there is exactly one it's selected by default,
  // otherwise none is. `undefined` = the user hasn't picked yet; picking "Select election" (null) is respected.
  const { data: featureOptions } = useGetFeaturesDropdownQuery();
  const features = Array.isArray(featureOptions?.data) ? featureOptions.data : [];
  const [pickedFeatureId, setFeatureId] = useState(undefined);
  const featureId =
    pickedFeatureId !== undefined ? pickedFeatureId : features.length === 1 ? features[0].id : null;
  // currentData (not data) so the previous election's numbers don't linger while the next one loads.
  // fulfilledTimeStamp changes on every successful response (new election, cached election or refetch),
  // so it's used below to redraw the ward labels, which are bound once per layer.
  const { currentData: resultData, fulfilledTimeStamp: resultStamp } = useGetResultByFeatureIdQuery(
    { featureId },
    { skip: featureId == null },
  );
  const results = Array.isArray(resultData?.candidates) ? resultData : null;
  const candidateImages = useMemo(
    () => Object.fromEntries((results?.candidates ?? []).map((c) => [c.id, c.image])),
    [results],
  );

  // A union-based election opens on its union once per election; "Show all unions" still zooms out.
  const [autoSelectedFor, setAutoSelectedFor] = useState(null);
  const resultUnionName = unionRows?.find((u) => u.id === results?.union_id)?.name;
  if (results && resultUnionName && autoSelectedFor !== results.feature_id) {
    setAutoSelectedFor(results.feature_id);
    setSelectedName(resultUnionName);
  }

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
      {/* left-14 clears Leaflet's zoom buttons in the top-left corner */}
      {/* Narrow on phones (max 14rem, never reaching the panel toggle); 20rem from `sm` up. */}
      <div className="absolute left-14 top-3 z-[1000] flex w-[min(14rem,calc(100%-120px))] flex-col items-stretch gap-2 sm:w-80">
        {features.length > 0 && (
          <ElectionSelect
            options={features}
            value={featureId}
            onChange={(id) => {
              setFeatureId(id);
              setAutoSelectedFor(null); // let the new election's union (if any) be auto-selected
              setSelectedName(null); // every election (and "Select election") starts from the full upazila view
            }}
          />
        )}

        {/* Phones only: the legend panel (which highlights the selection) is usually hidden there. */}
        {selectedName && (
          <div className="flex items-center gap-2 rounded border border-gray-300 bg-white py-1 pl-2 pr-1 text-[13px] font-semibold text-gray-900 shadow sm:hidden">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: colorByName[selectedName] }}
            />
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="text-[11px] font-normal text-gray-500">ইউনিয়নের নাম:</span>
              <span className="truncate">{selectedName}</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedName(null)}
              aria-label="Show all unions"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 shadow">{error}</div>}
      </div>

      {collection && (
        <button
          type="button"
          onClick={() => setPanelOpen((open) => !open)}
          aria-expanded={panelOpen}
          aria-controls="map-legend-panel"
          aria-label={panelOpen ? 'Hide unions list' : 'Show unions list'}
          className="absolute right-3 top-3 z-[1001] flex h-10 w-10 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 shadow hover:bg-gray-50 sm:hidden"
        >
          {panelOpen ? <X size={20} /> : <List size={20} />}
        </button>
      )}

      {collection && (
        <div
          id="map-legend-panel"
          className={`absolute right-3 top-16 z-[1000] max-h-[80%] w-[min(16rem,calc(100%-24px))] flex-col rounded bg-white/95 py-2 text-xs text-gray-700 shadow sm:top-3 sm:flex ${
            panelOpen ? 'flex' : 'hidden'
          } ${results ? 'sm:w-64' : 'sm:w-auto'}`}
        >
          {results?.title && (
            <h2 className="mx-2 mb-2 border-b border-gray-200 pb-1.5 text-sm font-semibold text-gray-900">
              {results.title}
            </h2>
          )}
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

                {!selectedName && unionSummaries[name] && (
                  <ResultBreakdown summary={unionSummaries[name]} images={candidateImages} />
                )}

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
                            {results && <ResultBreakdown summary={summary} images={candidateImages} />}
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
                key={`${selectedName}-${results ? `${results.feature_id}-${resultStamp}` : 'plain'}`}
                data={selectedWards} style={styleWard} onEachFeature={bindWard} />
            )}

            <LockToBoundary collection={collection} selectedFeature={selectedFeature} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
