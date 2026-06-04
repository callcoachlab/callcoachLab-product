import { useEffect, useState } from 'react';
import { auditLogService } from '../services/auditLogService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/Toast';

const listFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.auditLogs)) return response.auditLogs;
  if (Array.isArray(response?.logs)) return response.logs;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [actionType, setActionType] = useState('');
  const [appliedActionType, setAppliedActionType] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchLogs();
  }, [page, appliedActionType]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await auditLogService.getAuditLogs({
        page,
        limit: 50,
        ...(appliedActionType ? { actionType: appliedActionType } : {}),
      });
      setLogs(listFromResponse(response));
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedActionType(actionType.trim());
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Audit Logs</h2>
        <p className="mt-1 text-gray-600">Review workspace activity and filter by action type</p>
      </div>

      <Card>
        <form onSubmit={handleFilter} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Action type"
            value={actionType}
            onChange={(event) => setActionType(event.target.value)}
            placeholder="WORKSPACE_UPDATED"
            fullWidth
          />
          <Button type="submit">Apply Filter</Button>
          <Button type="button" variant="ghost" onClick={() => { setActionType(''); setAppliedActionType(''); setPage(1); }}>
            Clear
          </Button>
        </form>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {logs.map((log) => {
                const logId = log._id || log.id;
                return (
                  <tr key={logId}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {log.actionType || log.action || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {log.actor?.email || log.user?.email || log.actorEmail || 'System'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {log.targetType || log.entityType || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No audit logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button variant="outline" disabled={logs.length < 50} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
