import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { Prospect } from "@repo/contracts";

export function ProspectList() {
  const navigate = useNavigate();

  const { isPending, data: prospects } = useQuery<Prospect[]>({
    queryKey: ['prospectsData'],
    queryFn: (): Promise<Prospect[]> =>
      fetch('/api/prospects').then((res) => res.json() as Promise<Prospect[]>),
  });

  if (isPending) return <div className="p-6 text-slate-500">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Prospects</h1>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
