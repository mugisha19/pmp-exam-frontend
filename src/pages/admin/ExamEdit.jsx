/**
 * Admin Exam Edit Page
 * Edit exam settings
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
    starts_at: "",
    ends_at: "",
    status: "active",
  });

  useEffect(() => {
    if (exam) {
      setFormData({
        title: exam.title || "",
        description: exam.description || "",
        time_limit_minutes: exam.time_limit_minutes || "",
        passing_score: exam.passing_score || 70,
        max_attempts: exam.max_attempts || "",
        starts_at: exam.starts_at ? new Date(exam.starts_at).toISOString().slice(0, 16) : "",
        ends_at: exam.ends_at ? new Date(exam.ends_at).toISOString().slice(0, 16) : "",
        status: exam.status || "active",
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
    }
    if (parseFloat(formData.passing_score) !== exam.passing_score) {
      updateData.passing_score = parseFloat(formData.passing_score);
    }
    if (formData.max_attempts && parseInt(formData.max_attempts) !== exam.max_attempts) {
      updateData.max_attempts = parseInt(formData.max_attempts);
    }
    if (formData.starts_at) {
      updateData.starts_at = new Date(formData.starts_at).toISOString();
    }
    if (formData.ends_at) {
      updateData.ends_at = new Date(formData.ends_at).toISOString();
    }
    if (formData.status !== exam.status) {
      updateData.status = formData.status;
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
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
