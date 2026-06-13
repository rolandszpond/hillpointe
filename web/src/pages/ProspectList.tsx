import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ProspectStatusSchema } from "@repo/contracts";
import type { Prospect, Unit, Tour } from "@repo/contracts";

export function ProspectList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "status" | "unit" | "assignee" | "tour">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { isPending, data: prospects } = useQuery<Prospect[]>({
    queryKey: ["prospectsData"],
    queryFn: (): Promise<Prospect[]> =>
      fetch("/api/prospects").then((res) => res.json() as Promise<Prospect[]>),
  });

  const { data: units = [] as Unit[] } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: (): Promise<Unit[]> =>
      fetch("/api/units").then((res) => res.json() as Promise<Unit[]>),
  });

  const { data: tours = [] as Tour[] } = useQuery<Tour[]>({
    queryKey: ["tours"],
    queryFn: (): Promise<Tour[]> =>
      fetch("/api/tours").then((res) => res.json() as Promise<Tour[]>),
  });

  if (isPending) return <div className="p-6 text-slate-500">Loading...</div>;

  const unitName = (unitId: string) => units.find((u) => u.id === unitId)?.name ?? "—";

  const assignees = Array.from(
    new Set((prospects ?? []).map((p) => p.assignee).filter((a): a is string => !!a))
  );

  const tourDate = (prospectId: string): string =>
    tours.find((t) => t.prospectId === prospectId && t.outcome === null)?.scheduledTime ?? "";

  const filtered = (prospects ?? [])
    .filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterUnit && p.assignedUnitId !== filterUnit) return false;
      if (filterAssignee && p.assignee !== filterAssignee) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal = "";
      let bVal = "";
      if (sortKey === "name")     { aVal = a.name; bVal = b.name; }
      if (sortKey === "status")   { aVal = a.status; bVal = b.status; }
      if (sortKey === "unit")     { aVal = a.assignedUnitId ? unitName(a.assignedUnitId) : ""; bVal = b.assignedUnitId ? unitName(b.assignedUnitId) : ""; }
      if (sortKey === "assignee") { aVal = a.assignee ?? ""; bVal = b.assignee ?? ""; }
      if (sortKey === "tour")     { aVal = tourDate(a.id); bVal = tourDate(b.id); }
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Prospects</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="">All statuses</option>
          {ProspectStatusSchema.options.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</option>
          ))}
        </select>

        <select
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="">All units</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="">All assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {(search || filterStatus || filterUnit || filterAssignee) && (
          <button
            onClick={() => { setSearch(""); setFilterStatus(""); setFilterUnit(""); setFilterAssignee(""); }}
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {(["name", "status", "unit", "assignee", "tour"] as const).map((col) => (
                <th
                  key={col}
                  onClick={() => {
                    if (sortKey === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
                    else { setSortKey(col); setSortDir("asc"); }
                  }}
                  className="cursor-pointer select-none px-4 py-3 text-left font-medium text-slate-600 hover:text-slate-900"
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                  {sortKey === col && (
                    <span className="ml-1 text-slate-400">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No prospects match the filters.</td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => void navigate(`/prospects/${p.id}`)}
                className="cursor-pointer hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700">
                    {p.status.replace(/_/g, " ").toUpperCase()}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.assignedUnitId ? unitName(p.assignedUnitId) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.assignee ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {tours.find((t) => t.prospectId === p.id && t.outcome === null) ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      {new Date(tours.find((t) => t.prospectId === p.id && t.outcome === null)!.scheduledTime).toLocaleDateString()}
                    </span>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
