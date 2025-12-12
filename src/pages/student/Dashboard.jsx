/**
 * Student Dashboard Page
 * Classic minimalistic design
 */

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import {
  Users,
  ClipboardList,
  Trophy,
  BookOpen,
  Clock,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useRecentGroups, useAvailableQuizzes } from "@/hooks/queries/useStudentDashboard";
import { Button } from "@/components/ui/Button";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: recentGroups, isLoading: groupsLoading } = useRecentGroups(4);
  const { data: availableQuizzes, isLoading: quizzesLoading } = useAvailableQuizzes(4);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header with Date */}
      <div className="bg-white border-2 border-gray-300 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {today}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Role</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">{user?.role}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-gray-700">
            <strong>Daily Goal:</strong> Complete at least one practice quiz to stay on track with your PMP preparation.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-300 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">My Groups</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{recentGroups?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Active groups</p>
        </div>

        <div className="bg-white border border-gray-300 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Quizzes</span>
            <ClipboardList className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{availableQuizzes?.length || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Available now</p>
        </div>

        <div className="bg-white border border-gray-300 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Completed</span>
            <Trophy className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-600 mt-1">This week</p>
        </div>

        <div className="bg-white border border-gray-300 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Avg Score</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">--</p>
          <p className="text-xs text-gray-600 mt-1">Overall average</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/exams")}
          className="bg-white border-2 border-gray-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <ClipboardList className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Take a Quiz</h3>
          <p className="text-sm text-gray-600 mb-3">Start practicing now</p>
          <div className="text-xs text-gray-500">
            {availableQuizzes?.length || 0} quizzes available
          </div>
        </button>

        <button
          onClick={() => navigate("/groups")}
          className="bg-white border-2 border-gray-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Join Groups</h3>
          <p className="text-sm text-gray-600 mb-3">Study with others</p>
          <div className="text-xs text-gray-500">
            {recentGroups?.length || 0} groups joined
          </div>
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="bg-white border-2 border-gray-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">View Progress</h3>
          <p className="text-sm text-gray-600 mb-3">Track your performance</p>
          <div className="text-xs text-gray-500">
            See detailed analytics
          </div>
        </button>
      </div>

      {/* Recent Quizzes */}
      {!quizzesLoading && availableQuizzes && availableQuizzes.length > 0 && (
        <div>
          <div className="border-b-2 border-gray-300 pb-2 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Quizzes</h2>
          </div>
          <div className="space-y-3">
            {availableQuizzes.slice(0, 4).map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white border border-gray-300 p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/exams/${quiz.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {quiz.question_count || 0} questions
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {quiz.time_limit || 0} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm">Start</Button>
                </div>
                {quiz.description && (
                  <p className="text-xs text-gray-600 pl-16 line-clamp-1">
                    {quiz.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          {availableQuizzes.length > 4 && (
            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/exams")}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                View all quizzes →
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Groups */}
      {!groupsLoading && recentGroups && recentGroups.length > 0 && (
        <div>
          <div className="border-b-2 border-gray-300 pb-2 mb-4">
            <h2 className="text-lg font-bold text-gray-900">My Groups</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentGroups.slice(0, 4).map((group) => (
              <div
                key={group.id}
                className="bg-white border border-gray-300 p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {group.description || "No description"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.member_count || 0}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" />
                      {group.quiz_count || 0}
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">View →</span>
                </div>
              </div>
            ))}
          </div>
          {recentGroups.length > 4 && (
            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/groups")}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                View all groups →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Study Tips & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>💡</span> Study Tip of the Day
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Consistent practice is key to passing the PMP exam. 
            Try to complete at least one quiz per day and review your mistakes thoroughly.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>📚</span> PMP Exam Info
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 180 questions in total</li>
            <li>• 230 minutes (3 hours 50 min)</li>
            <li>• Passing score: Above Target</li>
            <li>• Three domains: People, Process, Business</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
