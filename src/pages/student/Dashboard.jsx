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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Simple Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hello, {user?.first_name}
        </h1>
        <p className="text-gray-600">
          What would you like to do today?
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/exams")}
          className="bg-white border-2 border-gray-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <ClipboardList className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Take a Quiz</h3>
          <p className="text-sm text-gray-600">Start practicing now</p>
        </button>

        <button
          onClick={() => navigate("/groups")}
          className="bg-white border-2 border-gray-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Join Groups</h3>
          <p className="text-sm text-gray-600">Study with others</p>
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="bg-white border-2 border-gray-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">View Progress</h3>
          <p className="text-sm text-gray-600">Track your performance</p>
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
                className="bg-white border border-gray-300 p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => navigate(`/exams/${quiz.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>{quiz.question_count || 0} questions</span>
                      <span>•</span>
                      <span>{quiz.time_limit || 0} minutes</span>
                    </div>
                  </div>
                </div>
                <Button size="sm">Start</Button>
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
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {group.description || "No description"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      <span>{group.member_count || 0} members</span>
                      <span>•</span>
                      <span>{group.quiz_count || 0} quizzes</span>
                    </div>
                  </div>
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

      {/* Study Tip */}
      <div className="bg-blue-50 border border-blue-200 p-6 text-center">
        <p className="text-sm text-gray-700">
          <strong>Tip:</strong> Consistent practice is key to passing the PMP exam. 
          Try to complete at least one quiz per day.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
