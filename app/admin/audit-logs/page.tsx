"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/lib/api-service";

interface AuditLog {
  _id: string;
  actorId: string;
  actorRole: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState({
    actorId: "",
    action: "",
    entityType: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async (nextFilter: typeof filter = filter) => {
    setLoading(true);
    try {
      const result = await apiService.getAuditLogs({
        actorId: nextFilter.actorId || undefined,
        action: nextFilter.action || undefined,
        entityType: nextFilter.entityType || undefined,
        dateFrom: nextFilter.dateFrom || undefined,
        dateTo: nextFilter.dateTo || undefined,
      });
      setLogs(result);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const csv = [
      ["Timestamp", "Actor", "Action", "Entity", "Entity ID", "Changes"],
      ...logs.map((log) => [
        new Date(log.createdAt).toISOString(),
        `${log.actorName} (${log.actorRole})`,
        log.action,
        log.entityType,
        log.entityId,
        JSON.stringify({ oldValue: log.oldValue, newValue: log.newValue }),
      ]),
    ]
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const clearFilters = () => {
    const emptyFilter = {
      actorId: "",
      action: "",
      entityType: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilter(emptyFilter);
    loadLogs(emptyFilter);
  };

  if (loading) {
    return <div className="p-8">Loading audit logs...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline">
            Export CSV
          </Button>
          <Button onClick={() => loadLogs()} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
          <Input
            placeholder="Actor ID"
            value={filter.actorId}
            onChange={(e) => setFilter({ ...filter, actorId: e.target.value })}
          />
          <Select onValueChange={(v) => setFilter({ ...filter, action: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(v) => setFilter({ ...filter, entityType: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear
            </Button>
            <Button onClick={() => loadLogs()} size="sm">
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{logs.length} Audit Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs
                .slice()
                .reverse()
                .map((log) => (
                  <TableRow
                    key={log._id}
                    onClick={() => setSelectedLog(log)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{log.actorName}</div>
                        <Badge variant="outline" className="mt-1">
                          {log.actorRole}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.entityType}:{log.entityId}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {Object.keys(log.newValue || log.oldValue || {}).join(
                        ", "
                      ) || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <strong>Timestamp:</strong>{" "}
                {new Date(selectedLog.createdAt).toLocaleString()}
              </div>
              <div>
                <strong>Actor:</strong> {selectedLog.actorName} (
                {selectedLog.actorRole})
              </div>
              <div>
                <strong>Action:</strong> {selectedLog.action}
              </div>
              <div>
                <strong>Entity:</strong> {selectedLog.entityType}:
                {selectedLog.entityId}
              </div>
              {selectedLog.ipAddress && (
                <div>
                  <strong>IP:</strong> {selectedLog.ipAddress}
                </div>
              )}
              {selectedLog.oldValue && (
                <div>
                  <strong>Old Value:</strong>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-auto max-h-20">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.newValue && (
                <div>
                  <strong>New Value:</strong>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-sm overflow-auto max-h-20">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p>{selectedLog.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
