import { useState, useEffect } from 'react';
import { ExecutionLog } from '../types';

interface LogsViewProps {
  token: string;
  onAddToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function LogsView({ token, onAddToast }: LogsViewProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error' | 'running'>('all');
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [token, limit, offset, statusFilter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const url = new URL('http://localhost:3000/api/v1/logs');
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('offset', offset.toString());

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      onAddToast('Failed to load logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = statusFilter === 'all' ? logs : logs.filter((log) => log.status === statusFilter);

  const handlePrevPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-400/10';
      case 'error':
        return 'text-red-400 bg-red-400/10';
      case 'running':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-slate-400 bg-slate-400/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'success', 'error', 'running'] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setOffset(0);
            }}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              statusFilter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Automation</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Triggered By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Started</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Loading logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {log.automationId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 capitalize">
                      {log.triggeredBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(log.startedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {log.durationMs ? `${log.durationMs}ms` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-slate-400">
        <span>
          Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} logs
        </span>
        <div className="space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={offset === 0}
            className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={offset + limit >= total}
            className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white">Execution Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <p className={`text-lg font-semibold ${getStatusColor(selectedLog.status).split(' ')[0]}`}>
                    {selectedLog.status}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Automation ID</p>
                  <p className="text-sm text-slate-300">{selectedLog.automationId}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Duration</p>
                  <p className="text-sm text-slate-300">
                    {selectedLog.durationMs ? `${selectedLog.durationMs}ms` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Triggered By</p>
                  <p className="text-sm text-slate-300 capitalize">{selectedLog.triggeredBy}</p>
                </div>
              </div>

              {selectedLog.output && (
                <div>
                  <p className="text-slate-400 text-sm mb-2">Output</p>
                  <pre className="bg-slate-900 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.output, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.error && (
                <div>
                  <p className="text-slate-400 text-sm mb-2">Error</p>
                  <pre className="bg-red-900/20 p-4 rounded-lg text-xs text-red-300 overflow-x-auto">
                    {selectedLog.error}
                  </pre>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-slate-500">
                  Created: {new Date(selectedLog.createdAt).toLocaleString()}
                  {selectedLog.finishedAt && (
                    <>
                      <br />
                      Finished: {new Date(selectedLog.finishedAt).toLocaleString()}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
