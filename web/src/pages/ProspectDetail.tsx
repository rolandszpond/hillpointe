import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Prospect } from "@repo/contracts";

export function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { isPending, data: prospect } = useQuery<Prospect>({
    queryKey: ["prospect", id],
    queryFn: (): Promise<Prospect> =>
      fetch(`/api/prospects/${id}`).then((res) => res.json() as Promise<Prospect>),
    enabled: !!id,
  });

  if (isPending) return <div className="p-6 text-slate-500">Loading...</div>;

  if (!prospect) {
    return (
      <div className="py-24 text-center text-slate-400">Prospect not found.</div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <button
        onClick={() => void navigate("/prospects")}
        className="mb-4 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Prospects
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{prospect.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
            <span>{prospect.email}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Info</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Assigned unit</dt>
            <dd className="text-slate-900">{prospect.assignedUnitId ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="text-slate-900">{prospect.status}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
