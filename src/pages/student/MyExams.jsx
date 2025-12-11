import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes } from "@/services/quiz.service";
import { getMyGroups } from "@/services/group.service";
import { Spinner } from "@/components/ui";
import {
  BookOpen,
  Calendar,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Globe,
  Users,
} from "lucide-react";

export const MyExams = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, upcoming, completed
  const [typeFilter, setTypeFilter] = useState("all"); // all, public, group

  // Fetch all quizzes (public + group quizzes)
  const { data: allQuizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["all-quizzes"],
    queryFn: () => getQuizzes({ limit: 200 }),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch user's groups to identify group quizzes
  const { data: myGroups } = useQuery({
    queryKey: ["my-groups"],
    queryFn: getMyGroups,
    staleTime: 2 * 60 * 1000,
  });

  // Handle different response structures from the backend
  let allQuizzes = [];
  if (allQuizzesData) {
    if (Array.isArray(allQuizzesData)) {
      allQuizzes = allQuizzesData;
    } else if (allQuizzesData.items && Array.isArray(allQuizzesData.items)) {
      allQuizzes = allQuizzesData.items;
    } else if (allQuizzesData.quizzes && Array.isArray(allQuizzesData.quizzes)) {
      allQuizzes = allQuizzesData.quizzes;
    }
  }

  const myGroupIds = new Set(
    (Array.isArray(myGroups) ? myGroups : []).map((g) => g.group_id).filter(Boolean)
  );

  // Filter quizzes
  const filteredQuizzes = allQuizzes.filter((quiz) => {
    // Search filter
    if (searchQuery && !quiz.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filter (public vs group)
    if (typeFilter !== "all") {
      const isGroupQuiz = quiz.group_id && myGroupIds.has(quiz.group_id);
      const isPublicQuiz = !quiz.group_id;
      
      if (typeFilter === "public" && !isPublicQuiz) return false;
      if (typeFilter === "group" && !isGroupQuiz) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = new Date();
      const startDate = new Date(quiz.start_date);
      const endDate = new Date(quiz.end_date);

      if (statusFilter === "active" && !(now >= startDate && now <= endDate && quiz.status === "active")) {
        return false;
      }
      if (statusFilter === "upcoming" && !(now < startDate)) {
        return false;
      }
      if (statusFilter === "completed" && !(quiz.status === "completed" || now > endDate)) {
        return false;
      }
    }

    return true;
  });

  const getQuizStatusBadge = (quiz) => {
    if (quiz.status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    }

    if (quiz.status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    }

    // Check if quiz has scheduling enabled
    if (quiz.scheduling_enabled && quiz.starts_at && quiz.ends_at) {
      const now = new Date();
      const startDate = new Date(quiz.starts_at);
      const endDate = new Date(quiz.ends_at);

      if (now > endDate) {
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Ended
          </span>
        );
      }

      if (now >= startDate && now <= endDate) {
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <Play className="w-3 h-3" />
            Active
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <Calendar className="w-3 h-3" />
          Scheduled
        </span>
      );
    }

    // No scheduling - always available if active
    if (quiz.status === "active" || quiz.is_available) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <Play className="w-3 h-3" />
          Available
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        <Calendar className="w-3 h-3" />
        Not Started
      </span>
    );
  };

  const canStartQuiz = (quiz) => {
    // Use backend's is_available flag if present
    if (typeof quiz.is_available === 'boolean') {
      return quiz.is_available && quiz.status !== "cancelled" && quiz.status !== "completed";
    }

    // Fallback: check scheduling
    if (quiz.scheduling_enabled && quiz.starts_at && quiz.ends_at) {
      const now = new Date();
      const startDate = new Date(quiz.starts_at);
      const endDate = new Date(quiz.ends_at);
      
      return (
        quiz.status !== "cancelled" &&
        quiz.status !== "completed" &&
        now >= startDate &&
        now <= endDate
      );
    }

    // No scheduling - available if active
    return quiz.status === "active" && quiz.status !== "cancelled";
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/exams/${quizId}`);
  };

  const handleViewAttempts = (quizId) => {
    navigate(`/exams/${quizId}/attempts`);
  };

  const getQuizTypeIcon = (quiz) => {
    if (!quiz.group_id) {
      return <Globe className="w-4 h-4 text-blue-600" />;
    }
    return <Users className="w-4 h-4 text-purple-600" />;
  };

  const getQuizTypeBadge = (quiz) => {
    if (!quiz.group_id) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
          <Globe className="w-3 h-3" />
          Public
        </span>
      );
    }
    
    const group = myGroups?.find((g) => g.group_id === quiz.group_id);
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
        <Users className="w-3 h-3" />
        {group?.name || "Group"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
        <p className="text-gray-600 mt-1">
          View and take all available quizzes from your groups and public quizzes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="public">Public Only</option>
            <option value="group">Group Only</option>
          </select>
        </div>
      </div>

      {/* Quizzes List */}
      {loadingQuizzes ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No quizzes found
          </h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters"
              : "No quizzes are available at the moment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.quiz_id}
              onClick={() => navigate(`/exams/${quiz.quiz_id}`)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getQuizTypeIcon(quiz)}
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {quiz.title}
                    </h3>
                    {getQuizStatusBadge(quiz)}
                    {getQuizTypeBadge(quiz)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{quiz.total_questions} questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.time_limit_minutes || 0} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" />
                      <span>{quiz.passing_score}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!loadingQuizzes && filteredQuizzes.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-900 font-medium">
              Showing {filteredQuizzes.length} of {allQuizzes.length} quizzes
            </span>
            <span className="text-xs text-blue-700">
              {filteredQuizzes.filter((q) => canStartQuiz(q)).length} available to take now
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyExams;
