import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { reminderService } from "@/services/reminder.service";
import { getQuizzes } from "@/services/quiz.service";
import { Bell, Plus, Trash2, Clock, Calendar, CheckCircle, XCircle, AlertCircle, X, Edit } from "lucide-react";
import { cn } from "@/utils/cn";
import { showToast } from "@/utils/toast.utils";

export const Reminders = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    quiz_id: "",
    message: "",
    scheduled_time: "",
    default_option: "",
  });

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders", filter],
    queryFn: () => reminderService.getReminders(filter === "all" ? null : filter),
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => getQuizzes(),
    select: (data) => data.quizzes || [],
  });

  const createMutation = useMutation({
    mutationFn: reminderService.createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
      setShowModal(false);
      resetForm();
      showToast.success("Success", "Reminder created successfully");
    },
    onError: (error) => {
      console.error("❌ Create reminder error:", error);
      console.error("❌ Error response:", error.response?.data);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Failed to create reminder";
      showToast.error("Error", errorMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ reminderId, data }) => reminderService.updateReminder(reminderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
      setShowModal(false);
      resetForm();
      showToast.success("Success", "Reminder updated successfully");
    },
    onError: () => {
      showToast.error("Error", "Failed to update reminder");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reminderService.deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
      showToast.success("Success", "Reminder deleted successfully");
    },
    onError: () => {
      showToast.error("Error", "Failed to delete reminder");
    },
  });

  const resetForm = () => {
    setFormData({
      quiz_id: "",
      message: "",
      scheduled_time: "",
      default_option: "",
    });
    setEditingReminder(null);
  };

  const handleOpenModal = (reminder = null) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        quiz_id: reminder.quiz_id || "",
        message: reminder.message || "",
        scheduled_time: reminder.scheduled_time ? new Date(reminder.scheduled_time).toISOString().slice(0, 16) : "",
        default_option: reminder.default_option || "",
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.quiz_id || !formData.scheduled_time) {
      showToast.error("Validation Error", "Please fill in all required fields");
      return;
    }

    // Get the selected quiz to use its title and check if it's scheduled
    const selectedQuiz = quizzes.find(q => q.quiz_id === formData.quiz_id);
    if (!selectedQuiz) {
      showToast.error("Error", "Selected quiz not found");
      return;
    }

    const title = `Reminder: ${selectedQuiz.title}`;
    
    // Determine reminder_type based on whether the quiz has scheduling enabled
    const reminderType = selectedQuiz.scheduling_enabled ? "quiz_scheduled" : "quiz_non_scheduled";

    const reminderData = {
      reminder_type: reminderType,
      real_quiz_id: formData.quiz_id,
      title: title,
      message: formData.message.trim() || null,
      scheduled_time: new Date(formData.scheduled_time).toISOString(),
      default_option: formData.default_option || null,
      extra_data: {}
    };

    if (editingReminder) {
      updateMutation.mutate({ reminderId: editingReminder.reminder_id, data: reminderData });
    } else {
      createMutation.mutate(reminderData);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-50 text-green-700 border-green-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      case "cancelled":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
                <p className="text-gray-600 mt-1">Manage your quiz reminders</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Reminder
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "sent", label: "Sent" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reminders yet</h3>
            <p className="text-gray-600 mb-6">Create your first reminder to stay on track</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.reminder_id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getStatusIcon(reminder.status)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {reminder.title}
                      </h3>
                      {reminder.message && (
                        <p className="text-gray-600 text-sm mb-3">{reminder.message}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(reminder.scheduled_time)}</span>
                        </div>
                        {reminder.default_option && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{reminder.default_option.replace(/_/g, " ")}</span>
                          </div>
                        )}
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            getStatusColor(reminder.status)
                          )}
                        >
                          {reminder.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {reminder.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(reminder)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(reminder.reminder_id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingReminder ? "Edit Reminder" : "Create Reminder"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Quiz Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Quiz <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.quiz_id}
                  onChange={(e) => setFormData({ ...formData, quiz_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="">Choose a quiz...</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.quiz_id} value={quiz.quiz_id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scheduled Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Default Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Type (Optional)
                </label>
                <select
                  value={formData.default_option}
                  onChange={(e) => setFormData({ ...formData, default_option: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Custom Time</option>
                  <option value="1_hour_before">1 Hour Before</option>
                  <option value="1_day_before">1 Day Before</option>
                  <option value="3_days_before">3 Days Before</option>
                  <option value="1_week_before">1 Week Before</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  placeholder="Add a personal reminder message..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {editingReminder ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    editingReminder ? "Update Reminder" : "Create Reminder"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
};

export default Reminders;
