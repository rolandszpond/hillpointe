import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProspectStatusSchema } from "@repo/contracts";
import type { Prospect, ProspectStatus, Task, ActivityEvent } from "@repo/contracts";

export function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isPending, data: prospect } = useQuery<Prospect>({
    queryKey: ["prospect", id],
    queryFn: (): Promise<Prospect> =>
      fetch(`/api/prospects/${id}`).then((res) => res.json() as Promise<Prospect>),
    enabled: !!id,
  });

  const { data: tasks = [] as Task[] } = useQuery<Task[]>({
    queryKey: ["tasks", id],
    queryFn: (): Promise<Task[]> =>
      fetch(`/api/tasks?prospectId=${id}`).then((res) => res.json() as Promise<Task[]>),
    enabled: !!id,
  });

  const { data: activityEvents = [] as ActivityEvent[] } = useQuery<ActivityEvent[]>({
    queryKey: ["activity-events", id],
    queryFn: (): Promise<ActivityEvent[]> =>
      fetch(`/api/activity-events?prospectId=${id}`).then((res) => res.json() as Promise<ActivityEvent[]>),
    enabled: !!id,
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: (status: ProspectStatus) =>
      fetch(`/api/prospects/${id!}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((res) => res.json() as Promise<Prospect>),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["prospect", id] });
    },
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
        <div className="flex w-full flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{prospect.name}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
              <span>{prospect.email}</span>
            </div>
          </div>

          <div>
            <div className="items-center rounded-full px-4 py-2 text-xs font-medium bg-blue-100 text-blue-700">{prospect.status.replace("_", " ").toUpperCase()}</div>
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
        </dl>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm my-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Update Pipeline</h2>
        <select
          value={prospect.status}
          disabled={isUpdating}
          onChange={(e) => updateStatus(e.target.value as ProspectStatus)}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
        >
          {ProspectStatusSchema.options.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm my-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-400">No tasks yet.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className={`text-sm ${task.state === "done" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Activity</h2>
        {activityEvents.length === 0 ? (
          <p className="text-sm text-slate-400">No activity yet.</p>
        ) : (
          <ol className="relative border-l border-slate-200 space-y-4 ml-2">
            {activityEvents.map((event) => (
              <li key={event.id} className="ml-4">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-slate-400" />
                <p className="text-sm text-slate-800">{event.summary}</p>
                <p className="text-xs text-slate-400">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
