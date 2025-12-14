/**
 * Admin Exam Edit Page
 * Edit exam settings and view statistics
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Settings,
  BarChart3,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Spinner } from "@/components/ui";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  getQuizById,
  updateQuiz,
  getQuizStats,
} from "@/services/quiz.service";

export default function ExamEdit() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("settings");

  const { data: exam, isLoading: loadingExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => getQuizById(examId),
    enabled: !!examId,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["exam-stats", examId],
    queryFn: () => getQuizStats(examId),
    enabled: !!examId && activeTab === "stats",
  });

  const [formData, setFormData] = useState({});

  const updateMutation = useMutation({
    mutationFn: (data) => updateQuiz(examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["exam", examId]);
      toast.success("Exam updated successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update exam");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateMutation.mutateAsync(formData);
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

  const tabs = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "stats", label: "Statistics", icon: BarChart3 },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Edit: ${exam.title}`}
        description="Update exam settings and view statistics"
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

      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "settings" && (
        <form onSubmit={handleSubmit}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Exam Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  defaultValue={exam.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  defaultValue={exam.description}
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
                    Time Limit (minutes)
                  </label>
                  <Input
                    type="number"
                    defaultValue={exam.time_limit_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_limit_minutes: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Score (%)
                  </label>
                  <Input
                    type="number"
                    defaultValue={exam.passing_score}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passing_score: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Attempts
                  </label>
                  <Input
                    type="number"
                    defaultValue={exam.max_attempts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_attempts: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    defaultValue={exam.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shuffle"
                  defaultChecked={exam.shuffle_questions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shuffle_questions: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="shuffle" className="text-sm text-gray-700">
                  Shuffle Questions
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="public"
                  defaultChecked={exam.is_public}
                  onChange={(e) =>
                    setFormData({ ...formData, is_public: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="public" className="text-sm text-gray-700">
                  Public Exam
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
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
      )}

      {activeTab === "stats" && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                  <p className="text-sm text-gray-600">Total Attempts</p>
                  <p className="text-3xl font-bold">{stats.total_attempts || 0}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-3xl font-bold">
                    {stats.pass_rate ? `${stats.pass_rate.toFixed(1)}%` : "0%"}
                  </p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold">
                    {stats.average_score ? `${stats.average_score.toFixed(1)}%` : "0%"}
                  </p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-gray-600">Avg Time</p>
                  <p className="text-3xl font-bold">
                    {stats.average_time_minutes
                      ? `${stats.average_time_minutes.toFixed(0)}m`
                      : "N/A"}
                  </p>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Additional Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Participants</p>
                    <p className="font-medium">{stats.total_participants || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="font-medium">
                      {stats.completion_rate
                        ? `${stats.completion_rate.toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6">
              <p className="text-center text-gray-500">No statistics available</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
