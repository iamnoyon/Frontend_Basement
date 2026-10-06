'use client';

/**
 * Renders ONLY Dhamrai Upazila (Dhaka District), split into its 16 unions + Dhamrai Paurashava:
 *  - each union is filled with its own color (hover for the name, legend in the corner)
 *  - click a union (on the map or in the legend) to zoom to it and show its wards, each in its own color;
 *    "Show all unions" zooms back out
 *  - everything outside the upazila is masked out
 *  - the view is zoomed to fit the upazila and locked so users can't pan away
 *
 * Data: public/geo/dhamrai-unions.geojson, extracted from the geoBoundaries BGD ADM4 dataset
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

const GEOJSON_URL = '/geo/dhamrai-unions.geojson';
const WARDS_URL = '/geo/dhamrai-wards.geojson';
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

const wardLabel = (feature) => `${feature.properties.union} – Ward ${feature.properties.ward}`;

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
  const [collection, setCollection] = useState(null);
  const [error, setError] = useState(null);
  const [wards, setWards] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(GEOJSON_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load unions (${res.status})`);
        return res.json();
      })
      .then((raw) => {
        const polygons = toPolygonCollection(raw);
        if (!polygons) throw new Error('Unions file has no Polygon/MultiPolygon geometry');
        setCollection(polygons);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      });

    // Wards are optional: if they fail to load, selecting a union just zooms to it.
    fetch(WARDS_URL, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw) => setWards(toPolygonCollection(raw)))
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

  const bindUnion = (feature, layer) => {
    layer.bindTooltip(feature.properties.name, { sticky: true });
    layer.on({
      click: () => setSelectedName(feature.properties.name),
      mouseover: () => layer.setStyle({ weight: 3, fillOpacity: 0.75 }),
      mouseout: () => layer.setStyle(styleRef.current(feature)),
    });
  };

  // Ward layers are recreated per union (see `key` below), so styleWard is never stale here.
  const bindWard = (feature, layer) => {
    layer.bindTooltip(wardLabel(feature), { sticky: true });
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
        <div className="absolute right-3 top-3 z-[1000] flex max-h-[calc(100%-24px)] flex-col rounded bg-white/90 py-2 text-xs text-gray-700 shadow">
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

                {name === selectedName && (
                  <ul className="mb-1 ml-5 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
                    {selectedWards ? (
                      selectedWards.features.map((ward) => (
                        <li key={ward.properties.code} className="flex items-center gap-2 py-0.5">
                          <span
                            className="h-3 w-3 shrink-0 rounded-sm"
                            style={{ backgroundColor: colorByWard.get(ward) }}
                          />
                          Ward {ward.properties.ward}
                        </li>
                      ))
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

            <GeoJSON data={collection} style={styleUnion} onEachFeature={bindUnion} />

            {selectedWards && (
              <GeoJSON key={selectedName} data={selectedWards} style={styleWard} onEachFeature={bindWard} />
            )}

            <LockToBoundary collection={collection} selectedFeature={selectedFeature} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
