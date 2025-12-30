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
  BookOpen,
  AlertCircle,
} from "lucide-react";

export const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

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
          onClick={() => navigate("/groups")}
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
          onClick={() => navigate("/groups")}
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

        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg border shadow-sm hover:shadow transition-all duration-200 p-4" style={{ borderColor: 'rgba(71, 96, 114, 0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(71, 96, 114, 0.1)' }}>
              <Calendar className="w-5 h-5" style={{ color: '#476072' }} />
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
        <div className="border-b-2 border-gray-200 pb-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Quizzes <span className="text-accent-primary">({quizzes.length})</span></h2>
        </div>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border-2 border-gray-200 shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No quizzes available</h3>
            <p className="text-sm text-gray-600 font-medium">Check back later for new quizzes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quiz_id}
                onClick={() => navigate(`/exams/${quiz.quiz_id}`)}
                className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl border-2 border-gray-100 shadow-md hover:shadow-xl hover:shadow-gray-200/50 p-6 hover:scale-[1.02] cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-accent-primary transition-colors duration-200">{quiz.title}</h3>
                </div>
                
                <div className="flex items-center gap-6 text-sm font-medium">
                  <span className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    {quiz.total_questions} questions
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-2 text-gray-700">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(71, 96, 114, 0.1)' }}>
                      <Clock className="w-3.5 h-3.5" style={{ color: '#476072' }} />
                    </div>
                    {quiz.time_limit_minutes || 0} min
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-blue-600" />
                    </div>
                    {quiz.passing_score}% pass
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
