import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAutomations } from '../hooks/useAutomations';
import { AutomationCard } from '../components/AutomationCard';

interface OutletContextType {
  onAddToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function AutomationsView() {
  const { token } = useAuth();
  const { onAddToast } = useOutletContext<OutletContextType>();
  const { automations, isLoading, fetchAutomations, toggleAutomation, executeNow, deleteAutomation } = useAutomations(token);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cronSchedule: '0 9 * * *',
    actionType: 'http',
    actionUrl: '',
  });

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const automation = {
      name: formData.name,
      description: formData.description,
      trigger: {
        type: 'cron',
        config: { schedule: formData.cronSchedule },
      },
      action: {
        type: formData.actionType,
        config:
          formData.actionType === 'http'
            ? { url: formData.actionUrl, method: 'GET' }
            : { message: 'Test automation' },
      },
    };

    const result = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/api/v1/automations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(automation),
    });

    if (result.ok) {
      onAddToast('Automation created successfully', 'success');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', cronSchedule: '0 9 * * *', actionType: 'http', actionUrl: '' });
      await fetchAutomations();
    } else {
      onAddToast('Failed to create automation', 'error');
    }
  };

  const handleToggle = async (id: string) => {
    const result = await toggleAutomation(id);
    if (result) {
      onAddToast('Automation toggled', 'success');
    } else {
      onAddToast('Failed to toggle automation', 'error');
    }
  };

  const handleExecute = async (id: string) => {
    const result = await executeNow(id);
    if (result) {
      onAddToast('Automation execution started', 'success');
    } else {
      onAddToast('Failed to execute automation', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      const result = await deleteAutomation(id);
      if (result) {
        onAddToast('Automation deleted', 'success');
      } else {
        onAddToast('Failed to delete automation', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Automations</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white rounded-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95 transition-all"
        >
          + Create Automation
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-slate-400">Loading automations...</div>
      ) : automations.length === 0 ? (
        <div className="text-center text-slate-400">No automations yet. Create one to get started!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onToggle={handleToggle}
              onExecute={handleExecute}
              onEdit={(id) => console.log('Edit', id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Create Automation</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="My automation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cron Schedule</label>
                <input
                  type="text"
                  value={formData.cronSchedule}
                  onChange={(e) => setFormData({ ...formData, cronSchedule: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="0 9 * * *"
                />
                <p className="text-xs text-slate-400 mt-1">e.g., "0 9 * * *" = every day at 9am</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Action Type</label>
                <select
                  value={formData.actionType}
                  onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="http">HTTP Request</option>
                  <option value="openai">OpenAI</option>
                  <option value="telegram">Telegram</option>
                </select>
              </div>

              {formData.actionType === 'http' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">URL</label>
                  <input
                    type="url"
                    required
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    placeholder="https://example.com/webhook"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
