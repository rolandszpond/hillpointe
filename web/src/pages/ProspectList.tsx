import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { Prospect, Unit, Tour } from "@repo/contracts";

export function ProspectList() {
  const navigate = useNavigate();

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Prospects</h1>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm table-fixed">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Unit</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Assignee</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Tour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prospects?.map((p) => (
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
