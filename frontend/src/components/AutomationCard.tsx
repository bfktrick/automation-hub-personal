import { Automation } from '../types';

interface AutomationCardProps {
  automation: Automation;
  onToggle: (id: string) => void;
  onExecute: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AutomationCard({
  automation,
  onToggle,
  onExecute,
  onEdit,
  onDelete,
}: AutomationCardProps) {
  const trigger = automation.trigger as any;
  const action = automation.action as any;

  return (
    <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:scale-105 transition-transform">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{automation.name}</h3>
          {automation.description && <p className="text-sm text-slate-400">{automation.description}</p>}
        </div>
        <button
          onClick={() => onToggle(automation.id)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            automation.isActive
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {automation.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <p className="text-slate-300">
          <span className="text-slate-400">Trigger:</span> {trigger?.type || 'unknown'}
          {trigger?.config?.schedule && <span> - {trigger.config.schedule}</span>}
        </p>
        <p className="text-slate-300">
          <span className="text-slate-400">Action:</span> {action?.type || 'unknown'}
        </p>
        {automation.lastRunAt && (
          <p className="text-slate-300">
            <span className="text-slate-400">Last run:</span> {new Date(automation.lastRunAt).toLocaleString()}
            <span className={`ml-2 ${automation.lastRunStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {automation.lastRunStatus}
            </span>
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onExecute(automation.id)}
          className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
        >
          Execute Now
        </button>
        <button
          onClick={() => onEdit(automation.id)}
          className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(automation.id)}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
