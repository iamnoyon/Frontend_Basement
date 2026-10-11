# Dhamrai Map: Location (Lat/Long) Data and APIs

This folder holds the map of Dhamrai Upazila (Dhaka District) and the admin screen for its elections.

- `DhamraiMap.jsx` is the public map. It is shown at `/` and `/map`. It colors each union and ward and shows election results on top.
- `AdminMap.jsx` is the admin screen. It edits an election's candidates and the total number for each ward.

All location data (the boundary shapes, as lat/long points) comes from the **backend API**. The browser never
reads the files in `public/geo/` directly. Those files are only the source the database was filled from.

---

## 1. Where the data comes from

```
geoBoundaries (unions) ─┐                          ┌─> GET /union/list ─┐
                        ├─> public/geo/*.geojson ─> database/dhamrai_geo_seed.sql ─> PostgreSQL ─┤                    ├─> DhamraiMap.jsx
DGHS GIS (wards) ───────┘                          └─> GET /ward/list  ─┘
```

| Layer | Original source | Local copy | Count |
| --- | --- | --- | --- |
| Unions | [geoBoundaries](https://www.geoboundaries.org) BGD ADM4 (BBS / OCHA ROAP, CC BY 3.0 IGO): `https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BGD/ADM4/geoBoundaries-BGD-ADM4_simplified.geojson` | `public/geo/dhamrai-unions.geojson` | 17 (16 unions + Dhamrai Paurashava) |
| Wards | [DGHS GIS](https://gis.dghs.gov.bd) ward layer: `https://gis.dghs.gov.bd/server/rest/services/Hosted/All_Wards_main/FeatureServer/0/query?where=district='Dhaka' AND upazila='Dhamrai'&outFields=*&outSR=4326&f=geojson` | `public/geo/dhamrai-wards.geojson` | 48 (3 per union; the paurashava has none) |

`public/geo/dhamrai-ward-results.json` holds sample election numbers from early development. Nothing in the app uses it now.

### Coordinate format

- The coordinate system is **EPSG:4326 (WGS84)**, the normal GPS lat/long.
- Each shape is a **GeoJSON** `Polygon` or `MultiPolygon`. The database stores it as JSONB.
- **GeoJSON writes each point as `[longitude, latitude]`**. Dhamrai points look like `[90.07785, 24.0123]`,
  so the first number is about 90 (longitude) and the second is about 24 (latitude).
  Leaflet uses the other order, `[lat, lng]`. `L.geoJSON` / `<GeoJSON>` swap the order for you. If you build
  Leaflet points by hand, swap them yourself (see `getOuterRings` in `DhamraiMap.jsx`).

---

## 2. Database (backend)

The script `database/dhamrai_geo_seed.sql` creates the tables and fills them. You can run it more than once
safely: it uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`, all inside one transaction.

```bash
psql "$DATABASE_URL" -f database/dhamrai_geo_seed.sql
```

| Table | Columns |
| --- | --- |
| `upazilas` | `id`, `name` (unique), `district` |
| `unions` | `id`, `upazila_id` → `upazilas`, `name`, `source_id` (geoBoundaries id), `is_paurashava`, `geometry` JSONB |
| `wards` | `id`, `union_id` → `unions`, `ward_no`, `code` (unique, e.g. `BD3026141091`), `geometry` JSONB |

The script only adds rows that are missing. To change a boundary that already exists, either `UPDATE` its
`geometry`, or delete the row and run the script again.

---

## 3. API endpoints

The base URL is `NEXT_PUBLIC_BACKEND_URL` in `.env`. If it isn't set, `http://localhost:8001/api` is used
(see `config/siteConfig.js`). Every request sends `credentials: include`. If `localStorage.token` is set, it is
also sent as `Authorization: Bearer <token>` (see `store/apiSlice.js`).

The endpoints are defined in `store/publilc_map/index.js`. Note the spelling of the folder name: `publilc_map`.

| Hook | Method & URL | Used by | Contains lat/long? |
| --- | --- | --- | --- |
| `useGetUnionsCoverageQuery` | `GET /union/list` | DhamraiMap, AdminMap | **Yes**: union shapes |
| `useGetWardsCoverageQuery` | `GET /ward/list` | DhamraiMap | **Yes**: ward shapes |
| `useGetFeaturesDropdownQuery` | `GET /feature/dropdown` | DhamraiMap, AdminMap | No |
| `useGetResultByFeatureIdQuery` | `GET /feature/result/:featureId` | DhamraiMap | No (linked to wards by `code`) |
| `useGetFeatureByIdQuery` | `GET /feature/:featureId` | AdminMap | No |
| `useUpdateFeatureByIdMutation` | `PUT /feature/:featureId` | AdminMap | No |

Only **`/union/list`** and **`/ward/list`** return lat/long. The other endpoints return election data, which the
map connects to the shapes through `union_id` and the ward `code`.

### `GET /union/list`: union boundaries

The response is an array (not wrapped in an object):

```json
[
  {
    "id": 1,
    "name": "Amta",
    "is_paurashava": false,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[90.07785, 24.0123], [90.07754, 24.01537], "..."]]
    }
  }
]
```

`geometry` is a GeoJSON geometry, in `[lng, lat]` order. `is_paurashava` is `true` only for Dhamrai Paurashava,
which has no wards.

### `GET /ward/list`: ward boundaries

The response is an array:

```json
[
  {
    "id": 1,
    "union_id": 1,
    "union_name": "Amta",
    "ward_no": 1,
    "code": "BD3026141091",
    "geometry": { "type": "Polygon", "coordinates": [[[90.07, 24.01], "..."]] }
  }
]
```

`union_name` is optional. If it is missing, the map finds the name from `/union/list` using `union_id`.
`code` is the key that connects a ward to its election results.

### `GET /feature/dropdown`: list of elections

```json
{ "data": [{ "id": 3, "title": "UP Election 2026" }] }
```

If the list has exactly one election, the map selects it automatically.

### `GET /feature/result/:featureId`: results for one election

```json
{
  "feature_id": 3,
  "title": "UP Election 2026",
  "union_id": null,
  "candidates": [{ "id": "a", "name": "Candidate A", "image": "https://..." }],
  "wards": {
    "BD3026141091": { "union_id": 1, "wardNo": 1, "Total_Number": 800, "votes": { "a": 275, "b": 386 } },
    "union-17":     { "union_id": 17, "wardNo": null, "Total_Number": 5000, "votes": { "a": 2100 } }
  }
}
```

- `wards` is an object keyed by ward `code`. An area with no wards (the paurashava) is keyed `union-<union_id>`
  and has `wardNo: null`.
- `Total_Number` is the total number of voters. The map also accepts the older names `total_number`,
  `totalVoters` and `total_voter`.
- If `union_id` is set, the election covers only that union, and the map zooms to it when the election is selected.
- The map uses the results only when `candidates` is an array. Otherwise it shows just the union and ward names.

### `GET /feature/:featureId` and `PUT /feature/:featureId`: edit an election (admin)

```json
{
  "data": {
    "id": 3, "title": "...", "is_union_based": false, "union_id": null, "status": "...",
    "candidates": [{ "id": "a", "name": "Candidate A", "image": "" }],
    "wards": [{ "code": "BD3026141091", "ward_id": 1, "ward_no": 1, "union_id": 1, "union_name": "Amta", "total_number": 800 }]
  }
}
```

The `PUT` request body contains `candidates` and the complete `wards` list (with the edited `total_number` values),
in the same shape as above. The paurashava row has `code`, `ward_id` and `ward_no` set to `null`.

---

## 4. How the map uses the data

1. **Convert the rows to GeoJSON.** `unionsToCollection` and `wardsToCollection` turn the API rows into GeoJSON
   `FeatureCollection`s and drop anything that isn't a `Polygon` or `MultiPolygon`.
2. **Hide everything outside Dhamrai.** A polygon the size of the whole world is drawn with every union's outer
   boundary cut out of it (`getOuterRings`). This hides everything outside the upazila.
3. **Fit and lock the view.** `LockToBoundary` uses the bounds of all unions to set the smallest allowed zoom and
   the area the user can pan in (bounds plus 10%). It then fits the view to the selected union, or to the whole
   upazila. The map uses fractional zoom (`zoomSnap 0.1`) and smaller padding on phones, so the area fills the screen.
4. **Draw the shapes.** Each union gets its own color. Clicking a union zooms to it and draws its wards from
   `/ward/list`, filtered by union name.
5. **Add the results.** Labels and the legend show votes per candidate, total voters, turnout and the leading
   candidate. Ward results are matched by `code`. Union totals add up the union's wards plus any `union-<id>` entry.
6. **Errors.** If `/union/list` fails or returns no shapes, a full-screen **Retry** card is shown. If the
   elections or results fail to load, a small banner with a Retry button appears under the election picker.
   Both buttons reload the page. If `/ward/list` fails, no message is shown: selecting a union only zooms to it.

---

## 5. Using the map in a page

Leaflet needs `window`, so load the map only in the browser:

```jsx
'use client';
import dynamic from 'next/dynamic';

const DhamraiMap = dynamic(() => import('@/components/modules/map/DhamraiMap'), {
  ssr: false,
  loading: () => <div className="h-dvh w-full animate-pulse bg-gray-100" />,
});

export default function Page() {
  return (
    <div className="h-dvh w-full">
      <DhamraiMap />
    </div>
  );
}
```

The parent element needs a height, because the map fills it. The result label style
(`.leaflet-tooltip.ward-result-label`) is in `app/globals.css`.

### Getting the lat/long somewhere else

Call the hook and read `geometry` from each row:

```jsx
import { useGetUnionsCoverageQuery } from '@/store/publilc_map';

const { data: unions } = useGetUnionsCoverageQuery();
unions?.forEach((u) => {
  const rings = u.geometry.type === 'Polygon' ? [u.geometry.coordinates] : u.geometry.coordinates;
  const [lng, lat] = rings[0][0][0]; // first point of the outer boundary
});
```

You can also call the API directly:

```bash
curl http://localhost:8001/api/union/list
curl http://localhost:8001/api/ward/list
```

---

## 6. Updating or adding boundaries

1. Download fresh data from the source URLs in section 1. Use `outSR=4326` for DGHS so the coordinates are lat/long.
2. Keep only the Dhamrai features, and rename the ward properties to `{ union, ward, code }`. Make sure each ward's
   `union` name matches the union `name` exactly.
3. Save the files as `public/geo/dhamrai-unions.geojson` and `public/geo/dhamrai-wards.geojson`.
4. Rebuild `database/dhamrai_geo_seed.sql` from them (one `INSERT` per feature, geometry as `'<geojson>'::jsonb`)
   and run it against the database.
5. If you add a new upazila, also add its row to `upazilas`. The map shows every union that `/union/list`
   returns, so the backend must filter the list if you want only one upazila on the map.
