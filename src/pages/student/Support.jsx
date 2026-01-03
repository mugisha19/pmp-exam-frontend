/**
 * Support Page
 * Submit and view support tickets
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportService } from "@/services/support.service";
import { showToast } from "@/utils/toast.utils";
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";

export const Support = () => {
  console.log("[Support] Component rendered");
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: () => supportService.getMyTickets(),
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
      setFormData({ subject: "", description: "", priority: "medium" });
    },
    onError: (error) => {
      showToast.error("Error", error.response?.data?.detail || "Failed to create ticket");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      showToast.error("Validation Error", "Please fill in all fields");
      return;
    }
    createMutation.mutate(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-700";
      case "in_progress": return "bg-yellow-100 text-yellow-700";
      case "resolved": return "bg-green-100 text-green-700";
      case "closed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600">Submit a ticket or view your existing support requests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Ticket Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#476072] to-[#5a7a8f] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Ticket</h2>
                <p className="text-sm text-gray-600">We'll respond within 24 hours</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about your issue..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none resize-none"
                  maxLength={5000}
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Tickets</h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-[#476072]/30 border-t-[#476072] rounded-full animate-spin" />
              </div>
            ) : !ticketsData || ticketsData?.tickets?.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No tickets yet</p>
                <p className="text-sm text-gray-500">Submit your first support ticket</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {ticketsData?.tickets?.map((ticket) => (
                  <div
                    key={ticket.ticket_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{ticket.subject}</h3>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(ticket.status))}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ticket.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className={cn("font-medium", getPriorityColor(ticket.priority))}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
