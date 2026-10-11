'use client';

/**
 * Durga Puja mondirs of one election ("feature"), grouped by union in a collapsible accordion, then by ward.
 *
 * Data: GET /feature/dropdown for the list of features, GET /durga-puja/list?feature_id=:id for the selected one
 * (see store/publilc_map).
 * /durga-puja/list -> { data: [{ id, feature_id, union_id, union_name, ward_code, ward_no,
 *   villages: [{ village_name, mondir_name, phone }], created_at, updated_at }] }
 */

import { useMemo, useState } from 'react';
import { ChevronDown, Phone, Plus, Trash2 } from 'lucide-react';
import { useGetDurgaPujaListQuery, useGetFeaturesDropdownQuery } from '@/store/publilc_map';

// entries -> [{ union_id, union_name, wards: [...], mondirCount }], unions in first-seen order, wards by number.
function groupByUnion(entries) {
  const groups = new Map();
  for (const entry of entries) {
    if (!groups.has(entry.union_id)) {
      groups.set(entry.union_id, { union_id: entry.union_id, union_name: entry.union_name, wards: [], mondirCount: 0 });
    }
    const group = groups.get(entry.union_id);
    group.wards.push(entry);
    group.mondirCount += entry.villages?.length ?? 0;
  }
  for (const group of groups.values()) group.wards.sort((a, b) => (a.ward_no ?? 0) - (b.ward_no ?? 0));
  return [...groups.values()];
}

// A counter, not crypto.randomUUID(), which is missing on plain-http LAN addresses (e.g. testing on a phone).
let draftSeq = 0;
const emptyDraft = () => ({ key: `draft-${++draftSeq}`, village_name: '', mondir_name: '', phone: '' });

const inputClass =
  'w-full min-w-28 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

// Villages of one ward, plus new mondir rows. A new row reuses the ward's village name, so only the mondir name and
// phone are entered; the village name is typed only when the ward has no villages yet.
// UI only for now: saved rows live in local state until the page reloads; wire handleSave to the API
// (POST /durga-puja/create) later.
function WardVillages({ villages }) {
  const [added, setAdded] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const rows = [...villages, ...added];
  const fixedVillage = rows.findLast((v) => v.village_name?.trim())?.village_name ?? null;
  const isDraftValid = (d) => (fixedVillage || d.village_name.trim()) && d.mondir_name.trim();

  const updateDraft = (key, field, value) =>
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, [field]: value } : d)));
  const removeDraft = (key) => setDrafts((prev) => prev.filter((d) => d.key !== key));
  const canSave = drafts.length > 0 && drafts.every(isDraftValid);

  const handleSave = () => {
    setAdded((prev) => [
      ...prev,
      ...drafts.map(({ village_name, mondir_name, phone }) => ({
        village_name: (fixedVillage ?? village_name).trim(),
        mondir_name: mondir_name.trim(),
        phone: phone.trim(),
      })),
    ]);
    setDrafts([]);
  };

  return (
    <div className="space-y-2">
      {rows.length > 0 || drafts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="w-10 px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">Village</th>
                <th className="px-3 py-2 text-left font-medium">Mondir</th>
                <th className="px-3 py-2 text-left font-medium">Phone</th>
                <th className="w-10 px-3 py-2" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((v, i) => (
                <tr key={`${v.village_name}-${v.mondir_name}-${i}`}>
                  <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                  <td className="px-3 py-2 text-gray-900">{v.village_name || '–'}</td>
                  <td className="px-3 py-2 text-gray-900">{v.mondir_name || '–'}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {v.phone ? (
                      <a
                        href={`tel:${v.phone}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Phone size={14} />
                        {v.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400">–</span>
                    )}
                  </td>
                  <td />
                </tr>
              ))}

              {drafts.map((d, i) => (
                <tr key={d.key} className="bg-amber-50/60">
                  <td className="px-3 py-2 text-gray-500">{rows.length + i + 1}</td>
                  <td className="px-3 py-1.5">
                    {fixedVillage ? (
                      <span className="text-gray-900">{fixedVillage}</span>
                    ) : (
                      <input
                        type="text"
                        value={d.village_name}
                        onChange={(e) => updateDraft(d.key, 'village_name', e.target.value)}
                        placeholder="Village name"
                        aria-label="Village name"
                        maxLength={100}
                        className={inputClass}
                      />
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      value={d.mondir_name}
                      onChange={(e) => updateDraft(d.key, 'mondir_name', e.target.value)}
                      placeholder="Mondir name"
                      aria-label="Mondir name"
                      maxLength={150}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="tel"
                      inputMode="tel"
                      value={d.phone}
                      onChange={(e) => updateDraft(d.key, 'phone', e.target.value)}
                      placeholder="01XXXXXXXXX"
                      aria-label="Phone number"
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => removeDraft(d.key)}
                      aria-label="Remove row"
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm italic text-gray-500">No villages added.</div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setDrafts((prev) => [...prev, emptyDraft()])}
          className="flex items-center gap-1 rounded border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          <Plus size={16} /> {fixedVillage ? 'Add mondir' : 'Add village'}
        </button>
        {drafts.length > 0 && (
          <>
            {!canSave && <span className="text-xs text-red-600">
                {fixedVillage ? 'Mondir name is required.' : 'Village and mondir name are required.'}
              </span>}
            <button
              type="button"
              onClick={() => setDrafts([])}
              className="ml-auto rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const wardLabel = (entry) => (entry.ward_no != null ? `Ward ${entry.ward_no}` : 'Whole area');

function UnionAccordion({ group, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
      >
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-500 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        <span className="flex-1 font-medium text-gray-900">{group.union_name || 'Unknown union'}</span>
        <span className="text-xs text-gray-500">
          {group.wards.length} ward{group.wards.length === 1 ? '' : 's'}
        </span>
        <span className="w-24 text-right text-sm font-medium text-gray-700">
          {group.mondirCount} mondir{group.mondirCount === 1 ? '' : 's'}
        </span>
      </button>

      {open && (
        <div className="divide-y divide-gray-100 border-t border-gray-200">
          {group.wards.map((entry) => (
            <div key={entry.id} className="px-4 py-3">
              <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-gray-900">{wardLabel(entry)}</span>
                {entry.ward_code && <span className="font-mono text-xs text-gray-500">{entry.ward_code}</span>}
              </div>

              <WardVillages villages={entry.villages ?? []} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Keyed by feature id in PujaDetails, so open panels reset when another feature is picked.
function PujaList({ entries }) {
  const groups = useMemo(() => groupByUnion(entries), [entries]);
  const [openUnions, setOpenUnions] = useState(() => new Set(groups.slice(0, 1).map((g) => g.union_id)));
  const mondirTotal = groups.reduce((sum, g) => sum + g.mondirCount, 0);

  const toggle = (unionId) =>
    setOpenUnions((prev) => {
      const next = new Set(prev);
      if (next.has(unionId)) next.delete(unionId);
      else next.add(unionId);
      return next;
    });

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
        No Durga Puja entries for this selection yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
        <div>
          <div className="text-xs text-gray-500">Unions</div>
          <div className="font-semibold text-gray-900">{groups.length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Wards</div>
          <div className="font-semibold text-gray-900">{entries.length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Mondirs</div>
          <div className="font-semibold text-gray-900">{mondirTotal}</div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setOpenUnions(new Set(groups.map((g) => g.union_id)))}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setOpenUnions(new Set())}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <UnionAccordion
            key={group.union_id}
            group={group}
            open={openUnions.has(group.union_id)}
            onToggle={() => toggle(group.union_id)}
          />
        ))}
      </div>
    </div>
  );
}

const PujaDetails = () => {
  const { data: featureOptions } = useGetFeaturesDropdownQuery();
  const features = Array.isArray(featureOptions?.data) ? featureOptions.data : [];
  const [pickedId, setPickedId] = useState(null);
  const featureId = pickedId ?? features[0]?.id ?? null;

  // currentData (not data) so the previous feature's list doesn't linger while the next one loads.
  const { currentData, isFetching, error } = useGetDurgaPujaListQuery({ featureId }, { skip: featureId == null });
  const entries = Array.isArray(currentData?.data) ? currentData.data : null;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Durga Puja details</h1>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Feature
          <select
            value={featureId ?? ''}
            onChange={(e) => setPickedId(Number(e.target.value))}
            disabled={features.length === 0}
            className="h-9 min-w-56 rounded border border-gray-300 bg-white px-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {features.length === 0 && <option value="">No features</option>}
            {features.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load Durga Puja list ({error.status})
        </div>
      ) : isFetching && !entries ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : entries ? (
        <PujaList key={featureId} entries={entries} />
      ) : null}
    </div>
  );
};

export default PujaDetails;
