import { Calendar as CalendarIcon, Clock } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Content Calendar</h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual planning timeline for scheduling drops and logging organic post results.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-xl border border-border-subtle bg-surface-raised text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center mx-auto">
          <CalendarIcon className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-slate-200">Content Calendar Ready</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Plan upcoming filming days, assign scripts to release slots, and mark posts as live.
        </p>
      </div>
    </div>
  );
}
