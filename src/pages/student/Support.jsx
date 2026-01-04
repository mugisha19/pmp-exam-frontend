import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportService } from "@/services/support.service";
import { showToast } from "@/utils/toast.utils";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const Support = () => {
  console.log("[Support] Component rendered");
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const data = await supportService.getMyTickets();
      console.log("[Support] Tickets data received:", data);
      return data;
    },
    retry: false,
    enabled: true,
    onError: (error) => {
      console.log("[Support] Failed to fetch tickets:", error);
    },
  });

  const createMutation = useMutation({
    mutationFn: supportService.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries(["support-tickets"]);
      showToast.success("Success", "Support ticket created successfully");
      setFormData({ subject: "", description: "" });
    },
    onError: (error) => {
      const errors = error.response?.data?.detail;
      if (Array.isArray(errors)) {
        const messages = errors.map((err) => err.msg).join(", ");
        showToast.error("Validation Error", messages);
      } else {
        showToast.error("Error", errors || "Failed to create ticket");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.subject.trim().length < 5) {
      showToast.error(
        "Validation Error",
        "Subject must be at least 5 characters"
      );
      return;
    }
    if (formData.description.trim().length < 10) {
      showToast.error(
        "Validation Error",
        "Description must be at least 10 characters"
      );
      return;
    }
    createMutation.mutate(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Support Center
          </h1>
          <p className="text-gray-600">
            Submit a ticket or view your existing support requests
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Ticket Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[500px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#476072] to-[#5a7a8f] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create Ticket
                </h2>
                <p className="text-sm text-gray-600">
                  We'll respond within 24 hours
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 flex-1 flex flex-col"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Brief description of your issue (min 5 characters)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none"
                  minLength={5}
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Provide detailed information about your issue (min 10 characters)..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none resize-none"
                  minLength={10}
                  maxLength={5000}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#476072] to-[#5a7a8f] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>

          {/* My Tickets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Tickets</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="w-8 h-8 border-3 border-[#476072]/30 border-t-[#476072] rounded-full animate-spin" />
              </div>
            ) : !ticketsData || ticketsData?.tickets?.length === 0 ? (
              <div className="text-center flex-1 flex items-center justify-center">
                <div>
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No tickets yet</p>
                  <p className="text-sm text-gray-500">
                    Submit your first support ticket
                  </p>
                </div>
              </div>
            ) : (
              (() => {
                const filteredTickets = ticketsData?.tickets?.filter(
                  (ticket) =>
                    statusFilter === "all" || ticket.status === statusFilter
                );
                return filteredTickets?.length === 0 ? (
                  <div className="text-center flex-1 flex items-center justify-center">
                    <div>
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No tickets found</p>
                      <p className="text-sm text-gray-500">
                        No tickets match the selected filter
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto flex-1">
                    {filteredTickets?.map((ticket) => (
                      <div
                        key={ticket.ticket_id}
                        onClick={() => openTicketModal(ticket)}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-[#476072]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                            {ticket.subject}
                          </h3>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ml-2",
                              getStatusColor(ticket.status)
                            )}
                          >
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {ticket.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="ml-1">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Ticket Detail Modal */}
        {isModalOpen && selectedTicket && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1",
                          getStatusColor(selectedTicket.status)
                        )}
                      >
                        {getStatusIcon(selectedTicket.status)}
                        {selectedTicket.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Created:{" "}
                        {new Date(selectedTicket.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                {selectedTicket.resolution_notes && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-green-900 mb-2">
                      Resolution Notes
                    </h3>
                    <p className="text-green-800 whitespace-pre-wrap">
                      {selectedTicket.resolution_notes}
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedTicket.updated_at && (
                      <div>
                        <span className="text-gray-500">Last Updated:</span>
                        <p className="text-gray-900">
                          {new Date(selectedTicket.updated_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedTicket.resolved_at && (
                      <div>
                        <span className="text-gray-500">Resolved At:</span>
                        <p className="text-gray-900">
                          {new Date(
                            selectedTicket.resolved_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
