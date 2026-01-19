/**
 * ReminderPanel Component
 * Slide-in panel for creating and viewing reminders
 */

import { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { X, Bell, Calendar, Info, Clock, Trash2, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import { reminderService } from "@/services/reminder.service";
import { getQuizzes } from "@/services/quiz.service";
import { showToast } from "@/utils/toast.utils";

export const ReminderPanel = ({ onClose, preselectedQuizId = null }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(!!preselectedQuizId);
  const [showOverdue, setShowOverdue] = useState(false);
  const [formData, setFormData] = useState({
    quiz_id: preselectedQuizId || "",
    title: "",
    message: "",
    scheduled_time: "",
    default_option: "",
    reminder_type: preselectedQuizId ? "quiz_non_scheduled" : "general",
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => getQuizzes(),
    select: (data) => data.quizzes || [],
  });

  const selectedQuiz = useMemo(() => {
    return quizzes.find((q) => q.quiz_id === formData.quiz_id);
  }, [quizzes, formData.quiz_id]);

  const isScheduledQuiz = useMemo(() => {
    return selectedQuiz?.scheduling_enabled && selectedQuiz?.starts_at;
  }, [selectedQuiz]);

  const needsScheduledTime = useMemo(() => {
    if (formData.reminder_type === "general") return true;
    if (!isScheduledQuiz) return true;
    return !formData.default_option || formData.default_option === "custom";
  }, [formData.reminder_type, formData.default_option, isScheduledQuiz]);

  const { data: allReminders = [], isLoading: loadingReminders } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => reminderService.getReminders(),
    refetchInterval: 30000,
  });

  const reminders = useMemo(() => {
    const now = new Date();
    const active = allReminders.filter(r => new Date(r.scheduled_time) > now)
      .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
    const overdue = allReminders.filter(r => new Date(r.scheduled_time) <= now)
      .sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
    return { active, overdue };
  }, [allReminders]);

  const createMutation = useMutation({
    mutationFn: reminderService.createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
      showToast.success("Success", "Reminder created successfully");
      setShowForm(false);
      setFormData({
        quiz_id: "",
        title: "",
        message: "",
        scheduled_time: "",
        default_option: "",
        reminder_type: "general",
      });
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to create reminder";
      showToast.error("Error", errorMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reminderService.deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
      showToast.success("Success", "Reminder deleted");
    },
    onError: (error) => {
      showToast.error("Error", "Failed to delete reminder");
    },
  });

  const handleQuizChange = (quizId) => {
    const quiz = quizzes.find((q) => q.quiz_id === quizId);
    const isScheduled = quiz?.scheduling_enabled && quiz?.starts_at;

    setFormData((prev) => ({
      ...prev,
      quiz_id: quizId,
      title: quizId ? "" : prev.title,
      reminder_type: quizId
        ? isScheduled
          ? "quiz_scheduled"
          : "quiz_non_scheduled"
        : "general",
      default_option: "",
      scheduled_time: "",
    }));
  };

  const handleDefaultOptionChange = (option) => {
    setFormData((prev) => ({
      ...prev,
      default_option: option,
      scheduled_time: option && option !== "custom" ? "" : prev.scheduled_time,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.reminder_type === "general") {
      if (!formData.scheduled_time) {
        showToast.error("Validation Error", "Please select a reminder date and time");
        return;
      }
    } else {
      if (!formData.quiz_id) {
        showToast.error("Validation Error", "Please select a quiz");
        return;
      }

      if (isScheduledQuiz) {
        if (!formData.default_option && !formData.scheduled_time) {
          showToast.error("Validation Error", "Please select a preset reminder time or enter a custom time");
          return;
        }
        if (formData.default_option === "custom" && !formData.scheduled_time) {
          showToast.error("Validation Error", "Please enter a custom reminder time");
          return;
        }
      } else {
        if (!formData.scheduled_time) {
          showToast.error("Validation Error", "Please select a reminder date and time");
          return;
        }
      }
    }

    const selectedQuiz = quizzes.find((q) => q.quiz_id === formData.quiz_id);

    let title;
    if (selectedQuiz) {
      title = `Reminder: ${selectedQuiz.title}`;
    } else {
      if (!formData.title.trim()) {
        showToast.error("Validation Error", "Please enter a reminder title");
        return;
      }
      title = formData.title.trim();
    }

    let reminderType = formData.reminder_type;
    if (formData.quiz_id && selectedQuiz) {
      reminderType = selectedQuiz.scheduling_enabled
        ? "quiz_scheduled"
        : "quiz_non_scheduled";
    }

    const reminderData = {
      reminder_type: reminderType,
      title: title,
      message: formData.message.trim() || null,
      extra_data: {},
    };

    if (formData.quiz_id) {
      reminderData.real_quiz_id = formData.quiz_id;
    }

    if (
      reminderType === "quiz_scheduled" &&
      formData.default_option &&
      formData.default_option !== "custom"
    ) {
      reminderData.default_option = formData.default_option;
    } else {
      if (formData.scheduled_time) {
        reminderData.scheduled_time = new Date(
          formData.scheduled_time
        ).toISOString();
      }
      if (formData.default_option === "custom") {
        reminderData.default_option = "custom";
      }
    }

    createMutation.mutate(reminderData);
  };

  const getTimeRemaining = (scheduledTime) => {
    const now = new Date();
    const target = new Date(scheduledTime);
    const diff = target - now;

    if (diff <= 0) return "Overdue";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleReminderClick = (reminder) => {
    if (reminder.real_quiz_id) {
      navigate(`/my-exams/${reminder.real_quiz_id}`);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#476072] to-[#5a7a8f] text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Reminders</h2>
                <p className="text-xs text-white/80">
                  {showForm ? "Create a new reminder" : `${reminders.active.length} active, ${reminders.overdue.length} overdue`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    title="Create new reminder"
                    className="px-3 py-1 text-xs font-medium text-white hover:bg-white/10 rounded transition-colors"
                  >
                    Create
                  </button>
                )}
                <button
                  onClick={onClose}
                  title="Close"
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {showForm ? (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Quiz Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Quiz {!preselectedQuizId && "(Optional)"}
              </label>
              <select
                value={formData.quiz_id}
                onChange={(e) => handleQuizChange(e.target.value)}
                disabled={!!preselectedQuizId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none text-sm disabled:bg-gray-100"
              >
                {!preselectedQuizId && <option value="">No Quiz - General Reminder</option>}
                {quizzes.map((quiz) => (
                  <option key={quiz.quiz_id} value={quiz.quiz_id}>
                    {quiz.title} {quiz.scheduling_enabled ? "(Scheduled)" : ""}
                  </option>
                ))}
              </select>
              {selectedQuiz && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <Info className="w-3 h-3" />
                  {isScheduledQuiz ? (
                    <span>
                      Starts at{" "}
                      <strong>
                        {new Date(selectedQuiz.starts_at).toLocaleString()}
                      </strong>
                    </span>
                  ) : (
                    <span>Set your own reminder time</span>
                  )}
                </div>
              )}
            </div>

            {/* Title - For general reminders */}
            {formData.reminder_type === "general" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter reminder title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none text-sm"
                  required
                  maxLength={300}
                />
              </div>
            )}

            {/* Default Option - For scheduled quizzes */}
            {isScheduledQuiz && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Time <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.default_option}
                  onChange={(e) => handleDefaultOptionChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none text-sm"
                >
                  <option value="">Select reminder time...</option>
                  <option value="1_hour_before">1 Hour Before Start</option>
                  <option value="1_day_before">1 Day Before Start</option>
                  <option value="3_days_before">3 Days Before Start</option>
                  <option value="1_week_before">1 Week Before Start</option>
                  <option value="custom">Custom Time</option>
                </select>
              </div>
            )}

            {/* Scheduled Time */}
            {needsScheduledTime && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isScheduledQuiz && formData.default_option === "custom"
                    ? "Custom Reminder Date & Time"
                    : "Reminder Date & Time"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_time}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_time: e.target.value })
                  }
                  min={new Date().toISOString().slice(0, 16)}
                  max={
                    isScheduledQuiz && selectedQuiz?.starts_at
                      ? new Date(selectedQuiz.starts_at)
                          .toISOString()
                          .slice(0, 16)
                      : undefined
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none text-sm"
                  required={needsScheduledTime}
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={3}
                placeholder="Add a personal reminder message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476072] focus:border-[#476072] outline-none resize-none text-sm"
              />
            </div>
              </form>
            ) : (
              <div className="p-4 space-y-3">
                {loadingReminders ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-3 border-[#476072]/30 border-t-[#476072] rounded-full animate-spin" />
                  </div>
                ) : reminders.active.length === 0 && reminders.overdue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No reminders yet</p>
                    <p className="text-xs text-gray-500 mb-4">Create your first reminder to get started</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#476072] to-[#5a7a8f] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Create Reminder
                    </button>
                  </div>
                ) : (
                  <>
                    {reminders.active.map((reminder) => {
                      const timeRemaining = getTimeRemaining(reminder.scheduled_time);
                      const isClickable = !!reminder.real_quiz_id;

                      return (
                        <div
                          key={reminder.reminder_id}
                          onClick={() => isClickable && handleReminderClick(reminder)}
                          className={cn(
                            "group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all",
                            isClickable && "cursor-pointer hover:border-[#476072]"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#476072] to-[#5a7a8f]">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                                {reminder.title}
                              </h3>
                              {reminder.message && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {reminder.message}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(reminder.scheduled_time).toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                                <Clock className="w-3 h-3" />
                                In {timeRemaining}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(reminder.reminder_id);
                              }}
                              disabled={deleteMutation.isPending}
                              title="Delete reminder"
                              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {reminders.overdue.length > 0 && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowOverdue(!showOverdue)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <span>Overdue ({reminders.overdue.length})</span>
                          <X className={cn("w-4 h-4 transition-transform", showOverdue ? "rotate-0" : "rotate-45")} />
                        </button>
                        {showOverdue && (
                          <div className="mt-2 space-y-2">
                            {reminders.overdue.map((reminder) => {
                              const isClickable = !!reminder.real_quiz_id;
                              
                              return (
                              <div
                                key={reminder.reminder_id}
                                onClick={() => isClickable && handleReminderClick(reminder)}
                                className={cn(
                                  "group relative bg-red-50 border border-red-200 rounded-xl p-4 hover:shadow-md transition-all",
                                  isClickable && "cursor-pointer hover:border-red-400"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-red-100">
                                    <Calendar className="w-5 h-5 text-red-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                                      {reminder.title}
                                    </h3>
                                    {reminder.message && (
                                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                        {reminder.message}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs">
                                      <div className="flex items-center gap-1 text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(reminder.scheduled_time).toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                      <Clock className="w-3 h-3" />
                                      Overdue
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMutation.mutate(reminder.reminder_id);
                                    }}
                                    disabled={deleteMutation.isPending}
                                    title="Delete reminder"
                                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );})}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {showForm && (
            <div className="px-4 py-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#476072] to-[#5a7a8f] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create Reminder"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    if (preselectedQuizId) onClose();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
