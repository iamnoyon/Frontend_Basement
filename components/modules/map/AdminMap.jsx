'use client';

/**
 * Admin view of one election ("feature"): its wards grouped by union in a collapsible accordion,
 * with an input per ward to edit its total number.
 *
 * Data: GET /feature/dropdown for the list of elections, GET /feature/:id for the selected one, PUT /feature/:id to
 * save it (see store/publilc_map).
 * /feature/:id -> { data: { id, title, is_union_based, union_name, status, candidates, wards: [
 *   { code, ward_id, ward_no, union_id, union_name, total_number }
 * ] } }
 * The paurashava has no wards, so it is one entry with code, ward_id and ward_no all null. If the API doesn't
 * return that entry yet, it is added from /union/list (is_paurashava) so its number can still be entered.
 */

import { useMemo, useState } from 'react';
import { ChevronDown, Loader2, Plus, Trash2, UserRound } from 'lucide-react';
import useToaster from '@/components/hooks/useToaster';
import {
  useGetFeatureByIdQuery,
  useGetFeaturesDropdownQuery,
  useGetUnionsCoverageQuery,
  useUpdateFeatureByIdMutation,
} from '@/store/publilc_map';

// Wards are keyed by code; the paurashava's ward-less entry (code null) by its union instead.
const wardKey = (w) => w.code ?? `union-${w.union_id}`;
// Older responses call the field total_voter.
const wardNumber = (w) => String(Number(w.total_number ?? w.total_voter) || 0);

// wards -> [{ union_id, union_name, wards: [...] }], unions in first-seen order, wards sorted by number.
function groupByUnion(wards) {
  const groups = new Map();
  for (const ward of wards) {
    if (!groups.has(ward.union_id)) {
      groups.set(ward.union_id, { union_id: ward.union_id, union_name: ward.union_name, wards: [] });
    }
    groups.get(ward.union_id).wards.push(ward);
  }
  for (const group of groups.values()) group.wards.sort((a, b) => (a.ward_no ?? 0) - (b.ward_no ?? 0));
  return [...groups.values()];
}

function UnionAccordion({ group, open, onToggle, values, onChange }) {
  const total = group.wards.reduce((sum, w) => sum + (Number(values[wardKey(w)]) || 0), 0);
  const changed = group.wards.filter((w) => values[wardKey(w)] !== wardNumber(w)).length;
  const wardCount = group.wards.filter((w) => w.code != null).length;

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
        {changed > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            {changed} edited
          </span>
        )}
        <span className="text-xs text-gray-500">
          {wardCount ? `${wardCount} ward${wardCount === 1 ? '' : 's'}` : 'No wards'}
        </span>
        <span className="w-28 text-right text-sm font-medium text-gray-700">{total.toLocaleString()}</span>
      </button>

      {open && (
        <table className="w-full border-t border-gray-200 text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Ward</th>
              <th className="px-4 py-2 text-left font-medium">Code</th>
              <th className="px-4 py-2 text-right font-medium">Total number</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {group.wards.map((ward) => {
              const key = wardKey(ward);
              const value = values[key];
              const dirty = value !== wardNumber(ward);
              const label = ward.ward_no != null ? `Ward ${ward.ward_no}` : 'Whole area';
              return (
                <tr key={key}>
                  <td className="px-4 py-2 text-gray-900">{label}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{ward.code ?? '–'}</td>
                  <td className="px-4 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={value}
                      onChange={(e) => onChange(key, e.target.value)}
                      aria-label={`Total number, ${group.union_name} ${label}`}
                      className={`w-32 rounded border px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        dirty ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                      }`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Candidate ids follow the backend's "a", "b", ... pattern; past "z" they become "c27", "c28", ...
function nextCandidateId(candidates) {
  const used = new Set(candidates.map((c) => c.id));
  for (let i = 0; ; i++) {
    const id = i < 26 ? String.fromCharCode(97 + i) : `c${i + 1}`;
    if (!used.has(id)) return id;
  }
}

function CandidatesEditor({ candidates, initialCandidates, onChange }) {
  const initialById = useMemo(
    () => Object.fromEntries(initialCandidates.map((c) => [c.id, c])),
    [initialCandidates],
  );
  const dirty = JSON.stringify(candidates) !== JSON.stringify(initialCandidates);

  const update = (id, field, value) =>
    onChange(candidates.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  const remove = (id) => onChange(candidates.filter((c) => c.id !== id));
  const add = () => onChange([...candidates, { id: nextCandidateId(candidates), name: '', image: '' }]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3">
        <h2 className="flex-1 font-medium text-gray-900">
          Candidates <span className="text-sm font-normal text-gray-500">({candidates.length})</span>
        </h2>
        {dirty && (
          <button
            type="button"
            onClick={() => onChange(initialCandidates)}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Reset
          </button>
        )}
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add candidate
        </button>
      </div>

      {candidates.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-500">No candidates yet.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {candidates.map((c, index) => {
            const original = initialById[c.id];
            const isNew = !original;
            const nameMissing = !c.name.trim();
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                <span className="w-6 shrink-0 text-sm text-gray-500">{index + 1}.</span>
                {c.image ? (
                  <img
                    src={c.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <UserRound size={20} />
                  </span>
                )}
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => update(c.id, 'name', e.target.value)}
                  placeholder="Candidate name"
                  aria-label={`Candidate ${index + 1} name`}
                  aria-invalid={nameMissing}
                  className={`min-w-0 flex-1 rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    nameMissing
                      ? 'border-red-300'
                      : isNew || original.name !== c.name
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-300'
                  }`}
                />
                <input
                  type="url"
                  value={c.image ?? ''}
                  onChange={(e) => update(c.id, 'image', e.target.value)}
                  placeholder="Image URL"
                  aria-label={`Candidate ${index + 1} image URL`}
                  className={`min-w-0 flex-[1.5] rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isNew || (original.image ?? '') !== (c.image ?? '')
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-300'
                  }`}
                />
                {isNew && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">New</span>
                )}
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  aria-label={`Remove candidate ${c.name || index + 1}`}
                  className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Keyed by feature id in AdminMap, so edits and open panels reset when another election is picked.
function FeatureWards({ feature, onSaved }) {
  const [updateFeature, { isLoading: isSaving }] = useUpdateFeatureByIdMutation();
  const { successToaster, errorToaster } = useToaster();
  const { data: unionRows } = useGetUnionsCoverageQuery();

  const wards = useMemo(() => {
    // One entry per ward, even if the API repeats one (first occurrence wins).
    const seen = new Set();
    const list = (Array.isArray(feature.wards) ? feature.wards : []).filter((w) => {
      const id = w.ward_id ?? wardKey(w);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    // Add a ward-less entry for each paurashava in scope that the API didn't return.
    const missing = (Array.isArray(unionRows) ? unionRows : [])
      .filter((u) => u.is_paurashava && !list.some((w) => w.union_id === u.id))
      .filter((u) => !feature.is_union_based || feature.union_id === u.id)
      .map((u) => ({
        code: null,
        ward_id: null,
        ward_no: null,
        union_id: u.id,
        union_name: u.name,
        total_number: 0,
      }));
    return [...list, ...missing];
  }, [feature.wards, feature.is_union_based, feature.union_id, unionRows]);
  const groups = useMemo(() => groupByUnion(wards), [wards]);
  const initialValues = useMemo(() => Object.fromEntries(wards.map((w) => [wardKey(w), wardNumber(w)])), [wards]);
  const initialCandidates = useMemo(
    () =>
      (Array.isArray(feature.candidates) ? feature.candidates : []).map(({ id, name, image }) => ({
        id,
        name: name ?? '',
        image: image ?? '',
      })),
    [feature.candidates],
  );

  const [candidates, setCandidates] = useState(initialCandidates);
  // Only the edited inputs; everything else shows its saved value (which also covers rows that appear late,
  // like a paurashava added once /union/list loads).
  const [edits, setEdits] = useState({});
  const values = { ...initialValues, ...edits };
  const [openUnions, setOpenUnions] = useState(() => new Set(groups.slice(0, 1).map((g) => g.union_id)));

  const toggle = (unionId) =>
    setOpenUnions((prev) => {
      const next = new Set(prev);
      if (next.has(unionId)) next.delete(unionId);
      else next.add(unionId);
      return next;
    });

  const changedCount = wards.filter((w) => values[wardKey(w)] !== initialValues[wardKey(w)]).length;
  const grandTotal = wards.reduce((sum, w) => sum + (Number(values[wardKey(w)]) || 0), 0);
  const candidatesInvalid = candidates.some((c) => !c.name.trim());

  const handleCancel = () => {
    setCandidates(initialCandidates);
    setEdits({});
  };

  // Every ward (and the paurashava's ward-less entry) with its (possibly edited) total_number.
  const handleSave = () => {
    const payload = {
      candidates: candidates.map((c) => ({ id: c.id, name: c.name.trim(), image: c.image.trim() })),
      wards: wards.map((w) => ({
        code: w.code,
        ward_id: w.ward_id,
        ward_no: w.ward_no,
        union_id: w.union_id,
        union_name: w.union_name,
        total_number: Number(values[wardKey(w)]) || 0,
      })),
    };
    updateFeature({ featureId: feature.id, data: payload })
      .unwrap()
      .then((res) => {
        successToaster(res?.message || 'Election updated successfully!');
        // Reload so the saved values become the new baseline for Cancel and the edited highlights.
        setEdits({});
        onSaved?.();
      })
      .catch((err) => {
        errorToaster(err?.data?.message || 'Failed to update election.');
        console.log(err);
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
        <div>
          <div className="text-xs text-gray-500">Election</div>
          <div className="font-semibold text-gray-900">{feature.title}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Scope</div>
          <div className="text-gray-900">{feature.is_union_based ? feature.union_name : 'All unions'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Status</div>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
              feature.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {feature.status}
          </span>
        </div>
        <div>
          <div className="text-xs text-gray-500">Candidates</div>
          <div className="text-gray-900">{candidates.length}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-gray-500">Total number</div>
          <div className="font-semibold text-gray-900">{grandTotal.toLocaleString()}</div>
        </div>
      </div>

      <CandidatesEditor candidates={candidates} initialCandidates={initialCandidates} onChange={setCandidates} />

      <div className="flex flex-wrap items-center gap-2">
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
        {changedCount > 0 && (
          <>
            <span className="ml-auto text-sm text-amber-700">
              {changedCount} unsaved change{changedCount === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={() => setEdits({})}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
          This election has no wards.
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <UnionAccordion
              key={group.union_id}
              group={group}
              open={openUnions.has(group.union_id)}
              onToggle={() => toggle(group.union_id)}
              values={values}
              onChange={(key, value) => setEdits((prev) => ({ ...prev, [key]: value }))}
            />
          ))}
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 bg-white/95 px-4 py-3 sm:-mx-6 sm:px-6">
        {candidatesInvalid && (
          <span className="mr-auto text-sm text-red-600">Every candidate needs a name.</span>
        )}
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={candidatesInvalid || isSaving}
          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

const AdminMap = () => {
  const { data: featureOptions } = useGetFeaturesDropdownQuery();
  const features = Array.isArray(featureOptions?.data) ? featureOptions.data : [];
  const [pickedId, setPickedId] = useState(null);
  const featureId = pickedId ?? features[0]?.id ?? null;

  const { currentData, isFetching, error, refetch } = useGetFeatureByIdQuery({ featureId }, { skip: featureId == null });
  const feature = currentData?.data;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Ward voters</h1>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Election
          <select
            value={featureId ?? ''}
            onChange={(e) => setPickedId(Number(e.target.value))}
            disabled={features.length === 0}
            className="h-9 min-w-56 rounded border border-gray-300 bg-white px-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {features.length === 0 && <option value="">No elections</option>}
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
          Failed to load election ({error.status})
        </div>
      ) : isFetching && !feature ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : feature ? (
        <FeatureWards key={feature.id} feature={feature} onSaved={refetch} />
      ) : null}
    </div>
  );
};

export default AdminMap;
