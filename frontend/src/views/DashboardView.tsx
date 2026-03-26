import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogsView } from './LogsView';

interface KPIs {
  totalAutomations: number;
  activeAutomations: number;
  executionsToday: number;
  successRate: number;
}

interface OutletContextType {
  onAddToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function DashboardView() {
  const { token } = useAuth();
  const { onAddToast } = useOutletContext<OutletContextType>();
  const [kpis, setKpis] = useState<KPIs>({
    totalAutomations: 0,
    activeAutomations: 0,
    executionsToday: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showLogsTab, setShowLogsTab] = useState(false);

  useEffect(() => {
    fetchKPIs();
  }, [token]);

  const fetchKPIs = async () => {
    try {
      setIsLoading(true);

      // Fetch automations
      const autoRes = await fetch('/api/v1/automations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const automations = await autoRes.json();

      // Fetch logs
      const logsRes = await fetch('/api/v1/logs?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const logsData = await logsRes.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Use optional chaining to safely access logs
      const logs = logsData?.logs ?? [];

      const executionsToday = logs.filter((log: any) => {
        const logDate = new Date(log.createdAt);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      }).length;

      const successCount = logs.filter((log: any) => log.status === 'success').length;
      const errorCount = logs.filter((log: any) => log.status === 'error').length;
      const totalExecutions = successCount + errorCount;
      const successRate = totalExecutions > 0 ? Math.round((successCount / totalExecutions) * 100) : 0;

      // Use optional chaining for automations
      const autoList = automations ?? [];
      const activeCount = autoList.filter((auto: any) => auto.isActive).length;

      setKpis({
        totalAutomations: autoList.length,
        activeAutomations: activeCount,
        executionsToday,
        successRate,
      });
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      // Initialize KPIs with safe default values on error
      setKpis({
        totalAutomations: 0,
        activeAutomations: 0,
        executionsToday: 0,
        successRate: 0,
      });
      onAddToast('Failed to load dashboard', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:border-white/20 transition-colors">
          <p className="text-slate-300 text-sm mb-2">Total Automations</p>
          <p className="text-3xl font-bold text-white">
            {isLoading ? '-' : kpis.totalAutomations}
          </p>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:border-white/20 transition-colors">
          <p className="text-slate-300 text-sm mb-2">Active</p>
          <p className="text-3xl font-bold text-indigo-400">
            {isLoading ? '-' : kpis.activeAutomations}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {!isLoading && `${kpis.totalAutomations > 0 ? Math.round((kpis.activeAutomations / kpis.totalAutomations) * 100) : 0}%`}
          </p>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:border-white/20 transition-colors">
          <p className="text-slate-300 text-sm mb-2">Executions Today</p>
          <p className="text-3xl font-bold text-cyan-400">
            {isLoading ? '-' : kpis.executionsToday}
          </p>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:border-white/20 transition-colors">
          <p className="text-slate-300 text-sm mb-2">Success Rate</p>
          <p className="text-3xl font-bold text-green-400">
            {isLoading ? '-' : `${kpis.successRate}%`}
          </p>
        </div>
      </div>

      {/* Recent Logs Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Recent Executions</h2>
          <button
            onClick={() => setShowLogsTab(!showLogsTab)}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            {showLogsTab ? 'Hide' : 'View All'} →
          </button>
        </div>

        {showLogsTab ? (
          <LogsView token={token} onAddToast={onAddToast} />
        ) : (
          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg">
            <p className="text-slate-300">
              {isLoading ? 'Loading recent executions...' : 'Click "View All" to see execution logs'}
            </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Welcome to Automation Hub! 🚀</h2>
        <p className="text-slate-300 mb-4">
          Create automated tasks that run on your schedule. Get started by:
        </p>
        <ol className="text-slate-300 space-y-2 list-decimal list-inside">
          <li>Go to the "Automations" tab</li>
          <li>Click "Create Automation"</li>
          <li>Set up a trigger (cron, manual, or webhook)</li>
          <li>Choose an action (HTTP, OpenAI, Telegram, etc.)</li>
          <li>Watch your automation run automatically!</li>
        </ol>
      </div>
    </div>
  );
}
