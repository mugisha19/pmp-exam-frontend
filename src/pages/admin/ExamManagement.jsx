/**
 * Admin Exam Management Page
 * Manage published quizzes/exams
 */

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Users,
  Clock,
  Trophy,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizzes, deleteQuiz } from "@/services/quiz.service";

export default function ExamManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Modal states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    return params;
  }, [page, pageSize, statusFilter]);

  // Fetch exams
  const { data: examsData, isLoading, refetch } = useQuery({
    queryKey: ["admin-exams", queryParams],
    queryFn: () => getQuizzes(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const deleteExamMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-exams"]);
      toast.success("Exam deleted successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete exam");
    },
  });

  const exams = examsData?.quizzes || [];
  const totalCount = examsData?.total || 0;

  // Group exams by group_name
  const groupedExams = useMemo(() => {
    const groups = {};
    exams.forEach(exam => {
      const groupName = exam.group_name || "No Group";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(exam);
    });
    return groups;
  }, [exams]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // CRUD handlers
  const handleViewExam = useCallback(
    (exam) => {
      navigate(`/admin/exams/${exam.quiz_id}`);
    },
    [navigate]
  );

  const handleViewStats = useCallback(
    (exam) => {
      navigate(`/admin/exams/${exam.quiz_id}/stats`);
    },
    [navigate]
  );

  const handleDeleteExam = useCallback((exam) => {
    setSelectedExam(exam);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedExam) return;

    try {
      await deleteExamMutation.mutateAsync(selectedExam.quiz_id);
      setIsDeleteDialogOpen(false);
      setSelectedExam(null);
      refetch();
    } catch (error) {
      // Error handled by mutation
    }
  }, [selectedExam, deleteExamMutation, refetch]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Exam Title",
        sortable: true,
        render: (_, exam) => (
          <span className="font-medium text-gray-900">
            {exam?.title}
          </span>
        ),
      },
      {
        key: "questions",
        header: "Questions",
        sortable: true,
        render: (_, exam) => (
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{exam?.total_questions || 0}</span>
          </div>
        ),
      },
      {
        key: "time_limit",
        header: "Time Limit",
        render: (_, exam) => (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{exam?.time_limit_minutes ? `${exam.time_limit_minutes} min` : "No limit"}</span>
          </div>
        ),
      },
      {
        key: "passing_score",
        header: "Pass %",
        render: (_, exam) => (
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gray-400" />
            <span>{exam?.passing_score || 70}%</span>
          </div>
        ),
      },
      {
        key: "attempts",
        header: "Attempts",
        render: (_, exam) => (
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{exam?.total_attempts || 0}</span>
          </div>
        ),
      },
    ],
    []
  );

  // Filters UI
  const filtersUI = (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
        options={[
          { value: "all", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ]}
        size="sm"
      />
    </div>
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Exam Management"
        subtitle="Manage published quizzes and exams"
      />

      {filtersUI}

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedExams).map(([groupName, groupExams]) => {
            const isExpanded = expandedGroups.has(groupName);
            return (
              <div key={groupName} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">{groupName}</span>
                    <Badge variant="default" size="sm">
                      {groupExams.length} {groupExams.length === 1 ? 'exam' : 'exams'}
                    </Badge>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <DataTable
                      data={groupExams}
                      columns={columns}
                      loading={false}
                      rowKey="quiz_id"
                      paginated={false}
                      emptyMessage="No exams in this group"
                      onRowClick={(exam) => handleViewExam(exam)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedExam(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Exam"
        message={`Are you sure you want to delete "${selectedExam?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteExamMutation.isPending}
      />
    </div>
  );
}
