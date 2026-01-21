/**
 * Admin Support Tickets Page
 * View and manage all support tickets
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  RefreshCcw,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { supportService } from "@/services/support.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const STATUS_CONFIG = {
  open: { color: "blue", icon: AlertCircle, label: "Open" },
  in_progress: { color: "yellow", icon: Clock, label: "In Progress" },
  resolved: { color: "green", icon: CheckCircle, label: "Resolved" },
  closed: { color: "gray", icon: XCircle, label: "Closed" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = config.icon;

  return (
    <Badge variant={config.color} size="sm">
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export const SupportTickets = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-support-tickets", statusFilter],
    queryFn: () => supportService.getAllTickets(statusFilter || null, 0, 100),
    staleTime: 30000,
  });

  const tickets = useMemo(() => {
    const allTickets = data?.tickets || [];
    if (!searchQuery) return allTickets;
    
    const query = searchQuery.toLowerCase();
    return allTickets.filter(
      (ticket) =>
        ticket.subject?.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.ticket_id?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const columns = [
    {
      key: "subject",
      header: "Subject",
      render: (_, row) => (
        <div className="max-w-md">
          <p className="font-medium text-gray-900 truncate">{row.subject || 'No subject'}</p>
          <p className="text-xs text-gray-500 truncate">{row.description || 'No description'}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      header: "Created",
      render: (_, row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A",
    },
    {
      key: "updated_at",
      header: "Updated",
      render: (_, row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "N/A",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        subtitle="Manage and respond to user support requests"
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCcw className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                size="sm"
              />
            </div>
            <div className="w-full lg:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={STATUS_OPTIONS}
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading tickets...</p>
            </div>
          ) : isError ? (
            <div className="p-8">
              <EmptyState
                icon={MessageSquare}
                title="Error loading tickets"
                description={error?.message || "Failed to load tickets"}
                actionLabel="Retry"
                onAction={() => refetch()}
              />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={MessageSquare}
                title="No tickets found"
                description={
                  searchQuery || statusFilter
                    ? "Try adjusting your filters"
                    : "No support tickets yet"
                }
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={tickets}
              rowKey="ticket_id"
              paginated={true}
              onRowClick={(ticket) =>
                navigate(`/support/${ticket.ticket_id}`)
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTickets;
