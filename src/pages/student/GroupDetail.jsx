import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGroupById } from "@/services/group.service";
import { getQuizzes } from "@/services/quiz.service";
import { Spinner } from "@/components/ui";
import { ExamCard } from "@/components/shared/ExamCard";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Users,
  Calendar,
  BookOpen,
  AlertCircle,
} from "lucide-react";

export const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("active");

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

  // Separate active and completed quizzes based on status
  const { activeQuizzes, completedQuizzes } = useMemo(() => {
    return {
      activeQuizzes: quizzes.filter(q => q.status === "active"),
      completedQuizzes: quizzes.filter(q => q.status === "completed" || q.status === "cancelled")
    };
  }, [quizzes]);

  const displayedQuizzes = filter === "active" ? activeQuizzes : completedQuizzes;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 font-medium">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h2>
        <p className="text-gray-600 mb-8 font-medium">The group you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate("/my-groups")}
          className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Back to Groups
        </button>
      </div>
    );
  }



  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-100 shadow-lg shadow-gray-100/50 p-8">
        <button
          onClick={() => navigate("/my-groups")}
          className="flex items-center gap-2 text-gray-600 hover:text-accent-primary mb-6 font-semibold transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm">Back to Groups</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{group.name}</h1>
        <p className="text-gray-600 text-lg font-medium leading-relaxed">{group.description}</p>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-lg transition-all duration-200 p-6 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Members</p>
              <p className="text-2xl font-bold text-gray-900">{group.member_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border-2 border-blue-100 shadow-md hover:shadow-lg transition-all duration-200 p-6 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg border shadow-sm hover:shadow transition-all duration-200 p-4" style={{ borderColor: 'rgba(255, 81, 0, 0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 81, 0, 0.1)' }}>
              <Calendar className="w-5 h-5" style={{ color: '#FF5100' }} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Duration</p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(group.from_date).toLocaleDateString()} - 
                {group.to_date ? new Date(group.to_date).toLocaleDateString() : "Ongoing"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Section */}
      <div>
        <div className="border-b-2 border-gray-200 pb-3 mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {filter === "active" ? "Available Quizzes" : "Completed Quizzes"} 
            <span className="text-accent-primary">({displayedQuizzes.length})</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                filter === "active"
                  ? "bg-accent-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Active ({activeQuizzes.length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                filter === "completed"
                  ? "bg-accent-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Completed ({completedQuizzes.length})
            </button>
          </div>
        </div>
        
        {displayedQuizzes.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-200 shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === "active" ? "No active quizzes" : "No completed quizzes"}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {filter === "active" ? "Check back later for new quizzes" : "Complete some quizzes to see them here"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedQuizzes.map((quiz) => (
              <ExamCard
                key={quiz.quiz_id}
                quiz={quiz}
                onClick={() => navigate(`/my-exams/${quiz.quiz_id}`)}
                variant="list"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;



