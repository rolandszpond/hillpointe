import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProspectStatusSchema, TourOutcomeSchema } from "@repo/contracts";
import type { Prospect, ProspectStatus, Task, ActivityEvent, Tour, Unit } from "@repo/contracts";

export function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [scheduleUnitId, setScheduleUnitId] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [outcomeSelections, setOutcomeSelections] = useState<Record<string, string>>({});

  const { isPending, data: prospect } = useQuery<Prospect>({
    queryKey: ["prospect", id],
    queryFn: (): Promise<Prospect> =>
      fetch(`/api/prospects/${id}`).then((res) => res.json() as Promise<Prospect>),
    enabled: !!id,
  });

  const { data: units = [] as Unit[] } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: (): Promise<Unit[]> =>
      fetch("/api/units").then((res) => res.json() as Promise<Unit[]>),
  });

  const { data: tours = [] as Tour[] } = useQuery<Tour[]>({
    queryKey: ["tours", id],
    queryFn: (): Promise<Tour[]> =>
      fetch(`/api/tours?prospectId=${id}`).then((res) => res.json() as Promise<Tour[]>),
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

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["prospect", id] });
    void queryClient.invalidateQueries({ queryKey: ["tours", id] });
    void queryClient.invalidateQueries({ queryKey: ["tasks", id] });
    void queryClient.invalidateQueries({ queryKey: ["activity-events", id] });
  };

  const { mutate: scheduleTour, isPending: isScheduling } = useMutation({
    mutationFn: () =>
      fetch("/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: id, unitId: scheduleUnitId, scheduledTime: new Date(scheduleTime).toISOString() }),
      }).then((res) => res.json()),
    onSuccess: () => {
      setScheduleUnitId("");
      setScheduleTime("");
      invalidateAll();
    },
  });

  const { mutate: recordOutcome } = useMutation({
    mutationFn: (tourId: string) =>
      fetch(`/api/tours/${tourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: outcomeSelections[tourId] }),
      }).then((res) => res.json()),
    onSuccess: () => invalidateAll(),
  });

  const { mutate: rescheduleTour } = useMutation({
    mutationFn: (tourId: string) =>
      fetch(`/api/tours/${tourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledTime: new Date(rescheduleTime).toISOString() }),
      }).then((res) => res.json()),
    onSuccess: () => {
      setReschedulingId(null);
      setRescheduleTime("");
      void queryClient.invalidateQueries({ queryKey: ["tours", id] });
    },
  });

  const { mutate: markDone } = useMutation({
    mutationFn: (taskId: string) =>
      fetch(`/api/tasks/${taskId}/done`, { method: "PATCH" }).then((res) => res.json()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      void queryClient.invalidateQueries({ queryKey: ["activity-events", id] });
    },
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
      void queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      void queryClient.invalidateQueries({ queryKey: ["activity-events", id] });
    },
  });

  if (isPending) return <div className="p-6 text-slate-500">Loading...</div>;
  if (!prospect) return <div className="py-24 text-center text-slate-400">Prospect not found.</div>;

  const unitName = (unitId: string) => units.find((u) => u.id === unitId)?.name ?? unitId;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <button
        onClick={() => void navigate("/prospects")}
        className="mb-4 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Prospects
      </button>

      <div className="mb-6 flex w-full flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{prospect.name}</h1>
          <div className="mt-1 text-sm text-slate-500">{prospect.email}</div>
        </div>
        <div className="rounded-full bg-blue-100 px-4 py-2 text-xs font-medium text-blue-700">
          {prospect.status.replace(/_/g, " ").toUpperCase()}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Info</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Assigned unit</dt>
            <dd className="text-slate-900">
              {prospect.assignedUnitId ? unitName(prospect.assignedUnitId) : "—"}
            </dd>
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
            <option key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm my-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Tours</h2>

        <div className="mb-4 flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Unit</label>
            <select
              value={scheduleUnitId}
              onChange={(e) => setScheduleUnitId(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">Select unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Date & time</label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <button
            onClick={() => scheduleTour()}
            disabled={!scheduleUnitId || !scheduleTime || isScheduling}
            className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-40"
          >
            Schedule
          </button>
        </div>

        {tours.length === 0 ? (
          <p className="text-sm text-slate-400">No tours scheduled.</p>
        ) : (
          <ul className="space-y-3">
            {tours.map((tour) => (
              <li key={tour.id} className="rounded border border-slate-100 p-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="font-medium text-slate-800">Unit {unitName(tour.unitId)}</span>
                    <span className="ml-2 text-slate-500">
                      {new Date(tour.scheduledTime).toLocaleString()}
                    </span>
                  </div>
                  {tour.outcome && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {tour.outcome.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                {!tour.outcome && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      value={outcomeSelections[tour.id] ?? ""}
                      onChange={(e) =>
                        setOutcomeSelections((prev) => ({ ...prev, [tour.id]: e.target.value }))
                      }
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                    >
                      <option value="">Record outcome</option>
                      {TourOutcomeSchema.options.map((o) => (
                        <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => recordOutcome(tour.id)}
                      disabled={!outcomeSelections[tour.id]}
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Save
                    </button>
                    <span className="text-slate-300">|</span>
                    {reschedulingId === tour.id ? (
                      <>
                        <input
                          type="datetime-local"
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                        />
                        <button
                          onClick={() => rescheduleTour(tour.id)}
                          disabled={!rescheduleTime}
                          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setReschedulingId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setReschedulingId(tour.id)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Reschedule
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
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
                {task.state === "open" && (
                  <button
                    onClick={() => markDone(task.id)}
                    className="shrink-0 rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Mark done
                  </button>
                )}
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
          <ol className="relative ml-2 space-y-4 border-l border-slate-200">
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
