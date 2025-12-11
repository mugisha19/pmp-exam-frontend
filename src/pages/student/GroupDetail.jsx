import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGroupById } from "@/services/group.service";
import { getQuizzes } from "@/services/quiz.service";
import { Spinner } from "@/components/ui";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  Trophy,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";

export const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quizzes"); // "quizzes" or "members"

  // Fetch group details
  const { data: group, isLoading: loadingGroup } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => getGroupById(groupId),
    enabled: !!groupId,
  });

  // Fetch quizzes for this group
  const { data: quizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["group-quizzes", groupId],
    queryFn: () => getQuizzes({ group_id: groupId, limit: 100 }),
    enabled: !!groupId,
  });

  const handleStartQuiz = (quizId) => {
    navigate(`/exams/${quizId}`);
  };

  const handleViewAttempts = (quizId) => {
    navigate(`/exams/${quizId}/attempts`);
  };

  const isLoading = loadingGroup || loadingQuizzes;
  
  // Handle different response structures from the backend
  let quizzes = [];
  if (quizzesData) {
    if (Array.isArray(quizzesData)) {
      quizzes = quizzesData;
    } else if (quizzesData.items && Array.isArray(quizzesData.items)) {
      quizzes = quizzesData.items;
    } else if (quizzesData.quizzes && Array.isArray(quizzesData.quizzes)) {
      quizzes = quizzesData.quizzes;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h2>
        <p className="text-gray-600 mb-6">The group you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/groups")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Groups
        </button>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/groups")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600 mt-1">{group.description}</p>
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">{group.member_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(group.from_date).toLocaleDateString()} - 
                {group.to_date ? new Date(group.to_date).toLocaleDateString() : "Ongoing"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "quizzes"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          Quizzes ({quizzes.length})
        </button>
      </div>

      {/* Quizzes List */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No quizzes available
              </h3>
              <p className="text-gray-600">
                Check back later for new quizzes from your instructor
              </p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.quiz_id}
                onClick={() => navigate(`/exams/${quiz.quiz_id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {quiz.title}
                      </h3>
                      {getQuizStatusBadge(quiz)}
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
