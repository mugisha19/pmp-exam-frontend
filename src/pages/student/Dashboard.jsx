/**
 * Student Dashboard Page
 * Modern course platform design
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Calendar,
  BookOpen,
  Users,
  ArrowRight,
} from "lucide-react";
import { useRecentGroups, useAvailableQuizzes } from "@/hooks/queries/useStudentDashboard";
import { SearchBar } from "@/components/shared/SearchBar";
import { ProgressCard } from "@/components/shared/ProgressCard";
import { QuizCard } from "@/components/shared/QuizCard";
import { ActivityStats } from "@/components/shared/ActivityStats";
import { Spinner } from "@/components/ui";
import { cn } from "@/utils/cn";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: recentGroups, isLoading: groupsLoading } = useRecentGroups(4);
  const { data: availableQuizzes, isLoading: quizzesLoading } = useAvailableQuizzes(10);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef(null);

  // Progress data - to be fetched from API
  const progressData = [];

  // Mentor/instructor data - to be fetched from API
  const mentors = [];

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Navigate to exams page with search query
    if (query) {
      navigate(`/exams?search=${encodeURIComponent(query)}`);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const filteredQuizzes = availableQuizzes?.filter((quiz) =>
    searchQuery
      ? quiz.title?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  ) || [];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search your courses/quizzes here..."
          onSearch={handleSearch}
          onFilterClick={() => navigate("/exams")}
        />
      </div>

      {/* Activity Statistics */}
      <ActivityStats />

      {/* Promotional Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-primary to-accent-secondary p-8 text-white shadow-lg">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">
            Sharpen Your Skills With Professional Online Courses
          </h2>
          <p className="text-white/90 mb-4">
            Master PMP concepts and ace your certification exam with our comprehensive course materials
          </p>
          <button
            onClick={() => navigate("/exams")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-accent-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Play className="w-5 h-5" />
            Join Now
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
      </div>

      {/* Course Progress Cards */}
      {progressData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {progressData.map((course, index) => (
              <ProgressCard
                key={index}
                title={course.title}
                completed={course.completed}
                total={course.total}
                onClick={() => navigate("/exams")}
              />
            ))}
          </div>
        </div>
      )}

      {/* Continue Watching Section */}
      {!quizzesLoading && filteredQuizzes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Continue Practice</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={scrollLeft}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={scrollRight}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          >
            {filteredQuizzes.slice(0, 6).map((quiz, index) => (
              <QuizCard
                key={quiz.quiz_id || quiz.id || index}
                quiz={quiz}
                category={quiz.group_id ? "GROUP" : "PUBLIC"}
                instructor={quiz.instructor || null}
                progress={quiz.progress || 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Your Mentor Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Mentor</h3>
          <button
            onClick={() => navigate("/groups")}
            className="text-sm text-accent-primary hover:text-accent-secondary font-medium"
          >
            See All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Instructor Name & Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Course Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Course Title
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mentors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-500">
                    No mentors available
                  </td>
                </tr>
              ) : (
                mentors.map((mentor) => (
                  <tr key={mentor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{mentor.name}</p>
                        <p className="text-xs text-gray-500">{mentor.date}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-accent-primary/10 text-accent-primary">
                        {mentor.courseType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900">{mentor.courseTitle}</p>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate("/exams")}
                        className="px-4 py-2 bg-accent-primary text-white text-xs font-medium rounded-lg hover:bg-accent-secondary transition-colors"
                      >
                        Show Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading States */}
      {quizzesLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
