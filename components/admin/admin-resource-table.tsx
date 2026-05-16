'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Edit3,
  Eye,
  Filter,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { adminResources, type AdminResourceKey } from '@/lib/admin/resources';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Row = Record<string, unknown>;
type FormValues = Record<string, unknown>;

type ResourceResponse = {
  data: Row[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const numberHints = ['amount', 'price', 'balance', 'equity', 'pct', 'days', 'order', 'count', 'split'];
const dateHints = ['_at', 'date'];
const longTextHints = ['content', 'body', 'note', 'reason', 'excerpt'];

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function isNumberField(name: string, value: unknown) {
  return typeof value === 'number' || numberHints.some((hint) => name.includes(hint));
}

function isDateField(name: string) {
  return dateHints.some((hint) => name.includes(hint));
}

function isLongTextField(name: string, value: unknown) {
  return (value !== null && typeof value === 'object') || Array.isArray(value) || longTextHints.some((hint) => name.includes(hint));
}

function parseFieldValue(field: string, value: string, currentValue: unknown) {
  if (typeof currentValue === 'boolean') return value === 'true';
  if (isNumberField(field, currentValue)) return value === '' ? null : Number(value);
  if (currentValue !== null && typeof currentValue === 'object' && value.trim()) return JSON.parse(value);
  if (Array.isArray(currentValue) && value.trim()) return JSON.parse(value);
  return value === '' ? null : value;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

export function AdminResourceTable({ resource }: { resource: AdminResourceKey }) {
  const config = adminResources[resource];
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState(config.idColumn);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [viewing, setViewing] = useState<Row | null>(null);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [saving, setSaving] = useState(false);

  const filterEntries = Object.entries(config.filterOptions ?? {});
  const canWrite = !config.readOnly;
  const firstRecordIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRecordIndex = Math.min(total, page * pageSize);
  const sortColumns = useMemo(
    () => Array.from(new Set([...config.columns, ...config.editable, config.idColumn])),
    [config]
  );

  const loadRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
      });

      if (search.trim()) params.set('search', search.trim());
      if (filterField && filterValue) {
        params.set('filterField', filterField);
        params.set('filterValue', filterValue);
      }

      const response = await fetch(`/api/admin/resources/${resource}?${params.toString()}`, { headers });
      const data = (await response.json()) as ResourceResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Unable to load data');

      setRows(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSortBy(config.idColumn);
    setSortOrder('desc');
    setFilterField('');
    setFilterValue('');
    setPage(1);
  }, [config.idColumn, resource]);

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, resource, sortBy, sortOrder]);

  const applyFilters = () => {
    setPage(1);
    loadRows();
  };

  const clearFilters = () => {
    setSearch('');
    setFilterField('');
    setFilterValue('');
    setSortBy(config.idColumn);
    setSortOrder('desc');
    setPage(1);
    setTimeout(loadRows, 0);
  };

  const startCreate = () => {
    setEditing(null);
    setViewing(null);
    setFormValues({ ...config.createDefaults });
  };

  const startEdit = (row: Row) => {
    const editableData = Object.fromEntries(config.editable.map((key) => [key, row[key] ?? null]));
    setEditing(row);
    setViewing(null);
    setFormValues(editableData);
  };

  const closeEditor = () => {
    setEditing(null);
    setFormValues(null);
  };

  const updateFormField = (field: string, rawValue: string, currentValue: unknown) => {
    try {
      setFormValues((current) => ({
        ...(current ?? {}),
        [field]: parseFieldValue(field, rawValue, currentValue),
      }));
      setError(null);
    } catch {
      setError(`${field} must be valid JSON.`);
    }
  };

  const save = async () => {
    if (!formValues) return;
    setSaving(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) };
      const id = editing?.[config.idColumn];
      const response = await fetch(
        id ? `/api/admin/resources/${resource}/${encodeURIComponent(String(id))}` : `/api/admin/resources/${resource}`,
        { method: id ? 'PATCH' : 'POST', headers, body: JSON.stringify(formValues) }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Save failed');
      closeEditor();
      await loadRows();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!canWrite) return;
    const id = row[config.idColumn];
    if (!id || !confirm(`Delete ${config.label} record ${String(id)}?`)) return;

    setSaving(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const response = await fetch(`/api/admin/resources/${resource}/${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
        headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Delete failed');
      await loadRows();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const reviewKyc = async (row: Row, status: 'approved' | 'rejected') => {
    const id = row[config.idColumn];
    if (!id) return;

    const rejectionReason = status === 'rejected'
      ? prompt('Rejection reason', 'Documents could not be verified.')
      : null;

    if (status === 'rejected' && !rejectionReason) return;

    setSaving(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) };
      const response = await fetch(`/api/admin/kyc/${encodeURIComponent(String(id))}/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status, rejectionReason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'KYC review failed');
      await loadRows();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'KYC review failed');
    } finally {
      setSaving(false);
    }
  };

  const patchRow = async (row: Row, patch: Row, successReload = true) => {
    const id = row[config.idColumn];
    if (!id) return;

    setSaving(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) };
      const response = await fetch(`/api/admin/resources/${resource}/${encodeURIComponent(String(id))}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Update failed');
      if (successReload) await loadRows();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const blockIpFromLog = async (row: Row) => {
    const ip = row.client_ip;
    if (!ip) return;
    const reason = prompt(`Block IP ${String(ip)}?`, 'Blocked from access logs.');
    if (!reason) return;

    setSaving(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) };
      const response = await fetch('/api/admin/resources/blockedIps', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ip_address: ip, reason, is_active: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'IP block failed');
      await loadRows();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'IP block failed');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: string, value: unknown) => {
    const options = config.filterOptions?.[field];
    const commonClass = 'w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50';

    if (typeof value === 'boolean') {
      return (
        <select value={String(value)} onChange={(event) => updateFormField(field, event.target.value, value)} className={commonClass}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }

    if (options?.length) {
      return (
        <select value={String(value ?? '')} onChange={(event) => updateFormField(field, event.target.value, value)} className={commonClass}>
          <option value="">Select {field}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }

    if (isLongTextField(field, value)) {
      return (
        <textarea
          value={value !== null && typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '')}
          onChange={(event) => updateFormField(field, event.target.value, value)}
          rows={field === 'content' ? 8 : 4}
          className={cn(commonClass, 'font-mono text-xs resize-y')}
        />
      );
    }

    return (
      <input
        type={isNumberField(field, value) ? 'number' : isDateField(field) ? 'datetime-local' : field === 'password' ? 'password' : 'text'}
        value={String(value ?? '')}
        onChange={(event) => updateFormField(field, event.target.value, value)}
        className={commonClass}
      />
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/8 px-3 py-1 text-xs text-amber-300 mb-3">
            <Database size={13} />
            {config.table}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{config.label}</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{config.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={loadRows} disabled={loading}>
            <RefreshCcw size={14} />
            Refresh
          </Button>
          {canWrite && (
            <Button type="button" size="sm" onClick={startCreate}>
              <Plus size={14} />
              Add {config.label}
            </Button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          ['Total Records', total.toLocaleString()],
          ['Visible Range', total ? `${firstRecordIndex}-${lastRecordIndex}` : '0'],
          ['Current Page', `${page} / ${totalPages}`],
          ['Mode', canWrite ? 'CRUD enabled' : 'Read only'],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-2xl border border-white/8 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-black text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl border border-white/8 p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
          className="grid gap-3 xl:grid-cols-[1fr_180px_180px_180px_130px_auto_auto]"
        >
          <div className="flex items-center gap-2 px-3 h-11 rounded-xl bg-white/5 border border-white/10">
            <Search size={15} className="text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={config.searchable.length ? `Search ${config.searchable.join(', ')}` : 'Search is disabled for this table'}
              disabled={config.searchable.length === 0}
              className="bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none w-full min-w-0"
            />
          </div>

          <select
            value={filterField}
            onChange={(event) => {
              setFilterField(event.target.value);
              setFilterValue('');
            }}
            className="h-11 rounded-xl bg-[#111] border border-white/10 px-3 text-sm text-white"
          >
            <option value="">No filter</option>
            {filterEntries.map(([field]) => <option key={field} value={field}>{field}</option>)}
          </select>

          <select
            value={filterValue}
            onChange={(event) => setFilterValue(event.target.value)}
            disabled={!filterField}
            className="h-11 rounded-xl bg-[#111] border border-white/10 px-3 text-sm text-white disabled:opacity-50"
          >
            <option value="">Any value</option>
            {(config.filterOptions?.[filterField] ?? []).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-11 rounded-xl bg-[#111] border border-white/10 px-3 text-sm text-white">
            {sortColumns.map((column) => <option key={column} value={column}>Sort: {column}</option>)}
          </select>

          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')} className="h-11 rounded-xl bg-[#111] border border-white/10 px-3 text-sm text-white">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          <Button type="submit" variant="outline" className="h-11">
            <Filter size={14} />
            Apply
          </Button>
          <Button type="button" variant="secondary" className="h-11" onClick={clearFilters}>Clear</Button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Action failed</p>
            <p className="text-red-200/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] border-b border-white/8">
              <tr>
                {config.columns.map((column) => (
                  <th key={column} className="px-4 py-3 text-left font-semibold text-slate-300 whitespace-nowrap">{column}</th>
                ))}
                <th className="px-4 py-3 text-right font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-b border-white/5">
                    {config.columns.map((column) => (
                      <td key={column} className="px-4 py-4"><div className="h-4 w-28 rounded bg-white/8 animate-pulse" /></td>
                    ))}
                    <td className="px-4 py-4"><div className="ml-auto h-8 w-24 rounded bg-white/8 animate-pulse" /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="px-4 py-14 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                      <Database size={20} />
                    </div>
                    <p className="text-sm font-semibold text-white">No records found</p>
                    <p className="text-xs text-slate-500 mt-1">Adjust filters or create a new record if this table should have data.</p>
                    <div className="mt-4 flex justify-center gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={clearFilters}>Clear filters</Button>
                      {canWrite && <Button type="button" size="sm" onClick={startCreate}>Add record</Button>}
                    </div>
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr key={String(row[config.idColumn])} className="border-b border-white/5 hover:bg-white/[0.025]">
                  {config.columns.map((column) => (
                    <td key={column} className="px-4 py-3 text-slate-300 max-w-[260px] truncate" title={displayValue(row[column])}>
                      {displayValue(row[column])}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setViewing(row)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 inline-flex items-center justify-center" title="View details">
                        <Eye size={14} />
                      </button>
                      {resource === 'siteAccessLogs' && Boolean(row.client_ip) && (
                        <button onClick={() => blockIpFromLog(row)} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 inline-flex items-center justify-center" title="Block this IP">
                          <XCircle size={14} />
                        </button>
                      )}
                      {canWrite && (
                        <>
                          {(resource === 'users' || resource === 'admins') && row.is_banned !== true && row.is_deleted !== true && (
                            <button onClick={() => patchRow(row, { is_banned: true })} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 inline-flex items-center justify-center" title="Block user">
                              <XCircle size={14} />
                            </button>
                          )}
                          {(resource === 'users' || resource === 'admins') && row.is_banned === true && row.is_deleted !== true && (
                            <button onClick={() => patchRow(row, { is_banned: false })} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 inline-flex items-center justify-center" title="Unblock user">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {resource === 'userDevices' && row.is_blocked !== true && (
                            <button onClick={() => patchRow(row, { is_blocked: true, block_reason: 'Blocked from admin dashboard.' })} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 inline-flex items-center justify-center" title="Block device dashboard access">
                              <XCircle size={14} />
                            </button>
                          )}
                          {resource === 'userDevices' && row.is_blocked === true && (
                            <button onClick={() => patchRow(row, { is_blocked: false, block_reason: null })} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 inline-flex items-center justify-center" title="Unblock device">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {resource === 'blockedIps' && row.is_active === true && (
                            <button onClick={() => patchRow(row, { is_active: false })} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 inline-flex items-center justify-center" title="Unblock IP">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {resource === 'blockedIps' && row.is_active !== true && (
                            <button onClick={() => patchRow(row, { is_active: true })} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 inline-flex items-center justify-center" title="Block IP">
                              <XCircle size={14} />
                            </button>
                          )}
                          {resource === 'kyc' && row.status !== 'approved' && (
                            <button onClick={() => reviewKyc(row, 'approved')} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 inline-flex items-center justify-center" title="Approve KYC">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {resource === 'kyc' && row.status !== 'rejected' && (
                            <button onClick={() => reviewKyc(row, 'rejected')} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 inline-flex items-center justify-center" title="Reject KYC">
                              <XCircle size={14} />
                            </button>
                          )}
                          <button onClick={() => startEdit(row)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 inline-flex items-center justify-center" title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => remove(row)} disabled={saving} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 inline-flex items-center justify-center" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-white/8">
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500">Showing {firstRecordIndex}-{lastRecordIndex} of {total}</p>
            <select
              value={pageSize}
              onChange={(event) => {
                setPage(1);
                setPageSize(Number(event.target.value));
              }}
              className="h-9 rounded-lg bg-[#111] border border-white/10 px-2 text-xs text-white"
            >
              {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}/page</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              <ChevronLeft size={14} />
              Previous
            </Button>
            <span className="px-3 text-xs text-slate-400">Page {page} / {totalPages}</span>
            <Button type="button" variant="secondary" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {formValues && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[92vh] rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div>
                <p className="text-sm font-semibold text-white">{editing ? 'Edit' : 'Add'} {config.label}</p>
                <p className="text-xs text-slate-500">Fields map directly to Supabase columns. Complex values use JSON.</p>
              </div>
              <button onClick={closeEditor} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(formValues).map(([field, value]) => (
                  <label key={field} className={cn('space-y-1.5', isLongTextField(field, value) && 'md:col-span-2')}>
                    <span className="text-xs font-semibold text-slate-300">{field}</span>
                    {renderField(field, value)}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/8">
              <Button type="button" variant="secondary" onClick={closeEditor}>Cancel</Button>
              <Button type="button" onClick={save} loading={saving}>Save changes</Button>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl h-full bg-[#0c0c0c] border-l border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div>
                <p className="text-sm font-semibold text-white">{displayValue(viewing[config.titleColumn])}</p>
                <p className="text-xs text-slate-500">{config.label} details</p>
              </div>
              <button onClick={() => setViewing(null)} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              {Object.entries(viewing).map(([field, value]) => (
                <div key={field} className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
                  <p className="text-xs text-slate-500">{field}</p>
                  <p className="text-sm text-slate-200 mt-1 break-words whitespace-pre-wrap">{displayValue(value)}</p>
                </div>
              ))}
            </div>
            {canWrite && (
              <div className="px-5 py-4 border-t border-white/8">
                <Button type="button" className="w-full" onClick={() => startEdit(viewing)}>Edit this record</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
