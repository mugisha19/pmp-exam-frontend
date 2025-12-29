/**
 * Admin Exam Edit Page
 * Edit exam settings
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Settings, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { getQuizById, updateQuiz } from "@/services/quiz.service";

export default function ExamEdit() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: exam, isLoading: loadingExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getQuizById(examId),
    enabled: !!examId,
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time_limit_minutes: "",
    passing_score: "",
    max_attempts: "",
    max_questions_practice: "",
    max_questions_exam: "",
    pause_after_questions: "",
    pause_duration_minutes: "",
    scheduling_enabled: false,
    starts_at: "",
    ends_at: "",
  });

  useEffect(() => {
    if (exam) {
      setFormData({
        title: exam.title || "",
        description: exam.description || "",
        time_limit_minutes: exam.time_limit_minutes || "",
        passing_score: exam.passing_score || 70,
        max_attempts: exam.max_attempts || "",
        max_questions_practice: exam.max_questions_practice || "",
        max_questions_exam: exam.max_questions_exam || "",
        pause_after_questions: exam.pause_after_questions || "",
        pause_duration_minutes: exam.pause_duration_minutes || "",
        scheduling_enabled: exam.scheduling_enabled || false,
        starts_at: exam.starts_at ? new Date(exam.starts_at).toISOString().slice(0, 16) : "",
        ends_at: exam.ends_at ? new Date(exam.ends_at).toISOString().slice(0, 16) : "",
      });
    }
  }, [exam]);

  const updateMutation = useMutation({
    mutationFn: (data) => updateQuiz(examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["exam", examId]);
      toast.success("Exam updated successfully");
      navigate(`/admin/exams/${examId}`);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update exam");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updateData = {};
    if (formData.title !== exam.title) updateData.title = formData.title;
    if (formData.description !== exam.description) updateData.description = formData.description;
    if (formData.time_limit_minutes && parseInt(formData.time_limit_minutes) !== exam.time_limit_minutes) {
      updateData.time_limit_minutes = parseInt(formData.time_limit_minutes);
    } else if (!formData.time_limit_minutes && exam.time_limit_minutes) {
      updateData.time_limit_minutes = null;
    }
    if (parseFloat(formData.passing_score) !== exam.passing_score) {
      updateData.passing_score = parseFloat(formData.passing_score);
    }
    if (formData.max_attempts && parseInt(formData.max_attempts) !== exam.max_attempts) {
      updateData.max_attempts = parseInt(formData.max_attempts);
    } else if (!formData.max_attempts && exam.max_attempts) {
      updateData.max_attempts = null;
    }
    if (formData.max_questions_practice && parseInt(formData.max_questions_practice) !== exam.max_questions_practice) {
      updateData.max_questions_practice = parseInt(formData.max_questions_practice);
    } else if (!formData.max_questions_practice && exam.max_questions_practice) {
      updateData.max_questions_practice = null;
    }
    if (formData.max_questions_exam && parseInt(formData.max_questions_exam) !== exam.max_questions_exam) {
      updateData.max_questions_exam = parseInt(formData.max_questions_exam);
    } else if (!formData.max_questions_exam && exam.max_questions_exam) {
      updateData.max_questions_exam = null;
    }
    if (formData.pause_after_questions && parseInt(formData.pause_after_questions) !== exam.pause_after_questions) {
      updateData.pause_after_questions = parseInt(formData.pause_after_questions);
    } else if (!formData.pause_after_questions && exam.pause_after_questions) {
      updateData.pause_after_questions = null;
    }
    if (formData.pause_duration_minutes && parseInt(formData.pause_duration_minutes) !== exam.pause_duration_minutes) {
      updateData.pause_duration_minutes = parseInt(formData.pause_duration_minutes);
    } else if (!formData.pause_duration_minutes && exam.pause_duration_minutes) {
      updateData.pause_duration_minutes = null;
    }
    if (formData.scheduling_enabled !== exam.scheduling_enabled) {
      updateData.scheduling_enabled = formData.scheduling_enabled;
    }
    if (formData.starts_at) {
      updateData.starts_at = new Date(formData.starts_at).toISOString();
    } else if (exam.starts_at) {
      updateData.starts_at = null;
    }
    if (formData.ends_at) {
      updateData.ends_at = new Date(formData.ends_at).toISOString();
    } else if (exam.ends_at) {
      updateData.ends_at = null;
    }

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save");
      return;
    }

    await updateMutation.mutateAsync(updateData);
  };

  if (loadingExam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Exam not found</p>
          <Button onClick={() => navigate("/admin/exams")} className="mt-4">
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Edit: ${exam.title}`}
        description="Update exam settings"
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate(`/admin/exams/${examId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exam
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Exam Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit (minutes) {exam.quiz_mode === "exam" && <span className="text-red-500">*</span>}
                </label>
                <Input
                  type="number"
                  value={formData.time_limit_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time_limit_minutes: e.target.value,
                    })
                  }
                  min="1"
                  disabled={exam.quiz_mode === "practice"}
                  required={exam.quiz_mode === "exam"}
                  placeholder={exam.quiz_mode === "practice" ? "Not applicable for practice mode" : ""}
                />
                {exam.quiz_mode === "practice" && (
                  <p className="text-xs text-gray-500 mt-1">Time limit cannot be set for practice mode</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Score (%)
                </label>
                <Input
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passing_score: e.target.value,
                    })
                  }
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Attempts
                </label>
                <Input
                  type="number"
                  value={formData.max_attempts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_attempts: e.target.value,
                    })
                  }
                  min="1"
                  placeholder="Unlimited"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for unlimited attempts
                </p>
              </div>
            </div>

            {/* Max Questions for Practice and Exam */}
            <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Question Limits
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Set maximum number of questions for practice and exam modes. Leave empty to use all questions.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Questions (Practice Mode)
                  </label>
                  <Input
                    type="number"
                    value={formData.max_questions_practice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_questions_practice: e.target.value,
                      })
                    }
                    min="0"
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Questions (Exam Mode)
                  </label>
                  <Input
                    type="number"
                    value={formData.max_questions_exam}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_questions_exam: e.target.value,
                      })
                    }
                    min="0"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </div>

            {/* Pause Settings */}
            <div className="space-y-3 bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                Pause Settings
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pause After Questions
                  </label>
                  <Input
                    type="number"
                    value={formData.pause_after_questions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pause_after_questions: e.target.value,
                      })
                    }
                    min="0"
                    placeholder="0 (no pause)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of questions before auto-pause
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pause Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.pause_duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pause_duration_minutes: e.target.value,
                      })
                    }
                    min="0"
                    max="60"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Duration of pause (0-60 minutes)
                  </p>
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="scheduling_enabled"
                  checked={formData.scheduling_enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduling_enabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="scheduling_enabled" className="text-sm font-medium text-gray-700">
                  Enable Scheduling
                </label>
              </div>
              <p className="text-xs text-gray-600">
                Enable to set start and end dates for the exam
              </p>

              {formData.scheduling_enabled && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Starts At
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.starts_at}
                      onChange={(e) =>
                        setFormData({ ...formData, starts_at: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ends At
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.ends_at}
                      onChange={(e) =>
                        setFormData({ ...formData, ends_at: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/admin/exams/${examId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              loading={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
