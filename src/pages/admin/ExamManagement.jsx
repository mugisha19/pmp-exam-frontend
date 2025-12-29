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
  Calendar,
  X,
  BookOpen,
  Users,
  Globe,
  Clock,
  Trophy,
  BarChart3,
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

/**
 * Format date for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ExamManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    };

    return params;
  }, [page, pageSize]);

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

  const exams = useMemo(() => {
    let data = examsData?.quizzes || [];

    // Apply filters
    if (searchQuery) {
      data = data.filter((exam) =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((exam) => exam.status === statusFilter);
    }

    if (typeFilter !== "all") {
      if (typeFilter === "public") {
        data = data.filter((exam) => exam.is_public && !exam.group_id);
      } else if (typeFilter === "group") {
        data = data.filter((exam) => exam.group_id);
      }
    }

    return data;
  }, [examsData, searchQuery, statusFilter, typeFilter]);

  const totalCount = exams.length;

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
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {exam?.group_name ? `${exam.group_name} - ${exam.title}` : exam?.title}
            </span>
            {exam?.description && (
              <span className="text-sm text-gray-500 truncate max-w-md">
                {exam.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (_, exam) => (
          <div className="flex items-center gap-2">
            {exam?.is_public && !exam?.group_id ? (
              <>
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Public</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Group</span>
              </>
            )}
          </div>
        ),
      },
      {
        key: "quiz_mode",
        header: "Mode",
        sortable: true,
        render: (_, exam) => (
          <Badge variant={exam?.quiz_mode === "exam" ? "primary" : "secondary"}>
            {exam?.quiz_mode || "practice"}
          </Badge>
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
        key: "status",
        header: "Status",
        sortable: true,
        render: (_, exam) => {
          const statusColors = {
            active: "success",
            draft: "secondary",
            completed: "default",
            cancelled: "danger",
          };
          return (
            <Badge variant={statusColors[exam?.status] || "default"}>
              {exam?.status || "draft"}
            </Badge>
          );
        },
      },
      {
        key: "created_at",
        header: "Created",
        sortable: true,
        render: (_, exam) => (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(exam?.created_at)}</span>
          </div>
        ),
      },
    ],
    []
  );

  // Filters UI
  const filtersUI = (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            size="sm"
          />
        </div>
      </div>

      <Select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
        options={[
          { value: "all", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "draft", label: "Draft" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ]}
        size="sm"
      />

      <Select
        value={typeFilter}
        onChange={(e) => {
          setTypeFilter(e.target.value);
          setPage(1);
        }}
        options={[
          { value: "all", label: "All Types" },
          { value: "public", label: "Public" },
          { value: "group", label: "Group" },
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

      <DataTable
        data={exams}
        columns={columns}
        loading={isLoading}
        rowKey="quiz_id"
        paginated={true}
        pageSize={pageSize}
        currentPage={page}
        totalPages={Math.ceil(totalCount / pageSize)}
        onPageChange={setPage}
        emptyMessage="No exams found"
        onRowClick={(exam) => handleViewExam(exam)}
      />

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
