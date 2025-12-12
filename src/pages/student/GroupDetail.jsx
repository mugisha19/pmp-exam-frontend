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



  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border-2 border-gray-300 p-6">
        <button
          onClick={() => navigate("/groups")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Groups</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h1>
        <p className="text-gray-600">{group.description}</p>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Members</p>
              <p className="text-xl font-bold text-gray-900">{group.member_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Quizzes</p>
              <p className="text-xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Duration</p>
              <p className="text-xs font-medium text-gray-900">
                {new Date(group.from_date).toLocaleDateString()} - 
                {group.to_date ? new Date(group.to_date).toLocaleDateString() : "Ongoing"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Section */}
      <div>
        <div className="border-b-2 border-gray-300 pb-2 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Available Quizzes ({quizzes.length})</h2>
        </div>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-300">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No quizzes available</h3>
            <p className="text-sm text-gray-600">Check back later for new quizzes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quiz_id}
                onClick={() => navigate(`/exams/${quiz.quiz_id}`)}
                className="bg-white border border-gray-300 p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {quiz.total_questions} questions
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {quiz.time_limit_minutes || 0} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
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
