/**
 * Admin Support Ticket Details Page
 * View and manage individual support ticket
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { supportService } from "@/services/support.service";
import { useUser } from "@/hooks/queries/useUserQueries";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const STATUS_CONFIG = {
  open: { color: "blue", icon: AlertCircle },
  in_progress: { color: "yellow", icon: Clock },
  resolved: { color: "green", icon: CheckCircle },
  closed: { color: "gray", icon: CheckCircle },
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const SupportTicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  console.log('=== SUPPORT TICKET DETAILS DEBUG ===');
  console.log('Ticket ID from params:', ticketId);
  console.log('Ticket ID type:', typeof ticketId);
  console.log('===================================');

  const { data: ticket, isLoading, isError, error } = useQuery({
    queryKey: ["support-ticket", ticketId],
    queryFn: () => supportService.getTicketById(ticketId),
    onSuccess: (data) => {
      if (!status) {
        setStatus(data.status);
      }
      if (!resolutionNotes) {
        setResolutionNotes(data.resolution_notes || "");
      }
    },
  });

  // Set initial status when ticket loads
  if (ticket && !status) {
    setStatus(ticket.status);
  }

  const { data: user } = useUser(ticket?.user_id, {
    enabled: !!ticket?.user_id,
  });

  const updateMutation = useMutation({
    mutationFn: (updateData) => supportService.updateTicket(ticketId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(["support-ticket", ticketId]);
      queryClient.invalidateQueries(["admin-support-tickets"]);
      toast.success("Ticket updated successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update ticket");
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate({
      status,
      resolution_notes: resolutionNotes || null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={60} />
        <Skeleton height={300} />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/admin/support")}
        >
          Back to Tickets
        </Button>
        <EmptyState
          icon={MessageSquare}
          title="Ticket not found"
          description={error?.message || "The ticket you're looking for doesn't exist"}
          actionLabel="Go Back"
          onAction={() => navigate("/admin/support")}
        />
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Support Ticket</span>
            <Badge variant={statusConfig.color} size="md">
              <StatusIcon className="w-4 h-4 mr-1" />
              {ticket.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate("/support")}
          >
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {ticket.subject}
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Ticket
              </h3>
              <div className="space-y-4">
                {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        options={STATUS_OPTIONS}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution Notes
                      </label>
                      <Textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Add notes about the resolution..."
                        rows={4}
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleUpdate}
                      loading={updateMutation.isPending}
                      disabled={status === ticket.status && resolutionNotes === (ticket.resolution_notes || "")}
                    >
                      Update Ticket
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      Ticket {ticket.status === 'resolved' ? 'Resolved' : 'Closed'}
                    </p>
                    <p className="text-sm text-gray-500">
                      This ticket has been {ticket.status === 'resolved' ? 'resolved' : 'closed'} and cannot be modified.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Ticket Information
              </h3>
              <div className="space-y-4">
                <InfoItem
                  icon={User}
                  label="Submitted By"
                  value={
                    user ? (
                      <div>
                        <div>{`${user.first_name} ${user.last_name}`}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    ) : (
                      "Loading..."
                    )
                  }
                />
                <InfoItem
                  icon={Calendar}
                  label="Created"
                  value={formatDateTime(ticket.created_at)}
                />
                <InfoItem
                  icon={Clock}
                  label="Updated"
                  value={formatDateTime(ticket.updated_at)}
                />
                {ticket.resolved_at && (
                  <InfoItem
                    icon={CheckCircle}
                    label="Resolved"
                    value={formatDateTime(ticket.resolved_at)}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {ticket.resolution_notes && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Resolution Notes
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {ticket.resolution_notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-blue-50 rounded-lg">
      <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  </div>
);

export default SupportTicketDetails;
