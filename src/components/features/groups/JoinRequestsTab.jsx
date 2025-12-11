/**
 * Join Requests Tab Component
 * Displays and manages pending join requests for private groups
 */

import { useState, useEffect } from "react";
import { Check, X, UserPlus, MessageSquare } from "lucide-react";
import {
  useGroupJoinRequests,
  useApproveJoinRequestMutation,
} from "@/hooks/queries/useGroupQueries";
import { DataTable } from "@/components/shared/DataTable";
import { UserCell } from "@/components/shared/UserCell";
import { Button } from "@/components/ui/Button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/Card";

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const JoinRequestsTab = ({ groupId }) => {
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isApproving, setIsApproving] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch join requests
  const { data: requestsData, isLoading, refetch, isError, error } = useGroupJoinRequests(groupId);

  // Approve/reject mutation
  const approveRequestMutation = useApproveJoinRequestMutation();

  // Refetch data when tab becomes active
  useEffect(() => {
    if (groupId) {
      refetch();
    }
  }, [groupId, refetch]);

  // Extract requests array - handle different response structures
  const requests = Array.isArray(requestsData)
    ? requestsData
    : requestsData?.items || requestsData?.requests || [];

  // Debug logging
  useEffect(() => {
    console.log('JoinRequestsTab - Raw data:', requestsData);
    console.log('JoinRequestsTab - Extracted requests:', requests);
    console.log('JoinRequestsTab - Loading:', isLoading);
    console.log('JoinRequestsTab - Error:', error);
  }, [requestsData, requests, isLoading, error]);

  // Handle approve/reject
  const handleApprove = (request) => {
    setSelectedRequest(request);
    setIsApproving(true);
    setMessage("");
    setResponseModalOpen(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setIsApproving(false);
    setMessage("");
    setResponseModalOpen(true);
  };

  const confirmResponse = async () => {
    if (selectedRequest) {
      await approveRequestMutation.mutateAsync({
        groupId,
        requestId: selectedRequest.id,
        approved: isApproving,
        message: message || undefined,
      });
      setResponseModalOpen(false);
      setSelectedRequest(null);
      setMessage("");
    }
  };

  // Table columns
  const columns = [
    {
      key: "user",
      header: "User",
      render: (_, request) => (
        <UserCell user={request.user || request} showEmail />
      ),
    },
    {
      key: "requested_at",
      header: "Requested Date",
      render: (_, request) => (
        <span className="text-sm text-gray-400">
          {formatDate(request.requested_at || request.created_at)}
        </span>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (_, request) => (
        <span className="text-sm text-gray-400 truncate max-w-[200px] block">
          {request.message || "No message"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "200px",
      sortable: false,
      render: (_, request) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Check className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(request);
            }}
            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleReject(request);
            }}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  if (!isLoading && requests.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={UserPlus}
          title="No pending requests"
          description="There are no pending join requests for this group."
        />
      </Card>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={requests}
        loading={isLoading}
        emptyMessage="No pending requests"
        emptyDescription="There are no pending join requests for this group."
        emptyIcon={UserPlus}
        paginated={true}
        pageSize={10}
        sortable={true}
      />

      {/* Response Modal */}
      <Modal
        isOpen={responseModalOpen}
        onClose={() => {
          setResponseModalOpen(false);
          setSelectedRequest(null);
          setMessage("");
        }}
        title={isApproving ? "Approve Join Request" : "Reject Join Request"}
        size="md"
      >
        <div className="space-y-4">
          {/* User Info */}
          {selectedRequest && (
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <UserCell
                user={selectedRequest.user || selectedRequest}
                showEmail
              />
            </div>
          )}

          {/* Info Message */}
          <div
            className={`p-4 rounded-xl border ${
              isApproving
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <p
              className={`text-sm ${
                isApproving ? "text-green-300" : "text-red-300"
              }`}
            >
              {isApproving
                ? "The user will be added to the group and notified of the approval."
                : "The user will be notified that their request was rejected."}
            </p>
          </div>

          {/* Optional Message */}
          <Textarea
            label={
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Message (Optional)</span>
              </div>
            }
            placeholder={
              isApproving
                ? "Welcome to the group! We're excited to have you..."
                : "Thank you for your interest, but we're unable to approve your request at this time..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setResponseModalOpen(false);
              setSelectedRequest(null);
              setMessage("");
            }}
            disabled={approveRequestMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant={isApproving ? "success" : "danger"}
            onClick={confirmResponse}
            loading={approveRequestMutation.isPending}
          >
            {isApproving ? "Approve" : "Reject"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default JoinRequestsTab;
