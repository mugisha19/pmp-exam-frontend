/**
 * Home Page (Landing)
 * Clean, modern home page with section-based layout
 */

import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { getQuizzes, getQuizAttempts } from "@/services/quiz.service";
import { useMyGroups } from "@/hooks/queries/useGroupQueries";
import {
  Play,
  BookOpen,
  Users,
  Trophy,
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
  CheckCircle,
  Zap,
  Calendar,
  Award,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch all quizzes
  const { data: allQuizzesData, isLoading: allQuizzesLoading } = useQuery({
    queryKey: ["all-quizzes-dashboard"],
    queryFn: () => getQuizzes({ limit: 100 }),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

  const allQuizzes = useMemo(
    () => allQuizzesData?.quizzes || allQuizzesData?.items || [],
    [allQuizzesData]
  );

  // Fetch all quiz attempts - refetch when allQuizzes changes
  const { data: allAttemptsData, refetch: refetchAttempts } = useQuery({
    queryKey: [
      "all-quiz-attempts",
      user?.user_id,
      allQuizzes.map((q) => q.quiz_id || q.id).join(","),
    ],
    queryFn: async () => {
      try {
        if (allQuizzes.length === 0) return { attempts: [] };

        const attemptsPromises = allQuizzes.map(async (quiz) => {
          try {
            const response = await getQuizAttempts(quiz.quiz_id || quiz.id);
            return response.attempts || [];
          } catch {
            return [];
          }
        });

        const attemptsArrays = await Promise.all(attemptsPromises);
        const allAttempts = attemptsArrays.flat();

        return { attempts: allAttempts };
      } catch (error) {
        console.error("Error fetching attempts:", error);
        return { attempts: [] };
      }
    },
    enabled: !!user?.user_id && allQuizzes.length > 0,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

  // Fetch groups
  const { data: myGroupsData } = useMyGroups();
  const myGroups = myGroupsData || [];

  // Calculate statistics
  const dashboardStats = useMemo(() => {
    const attempts = allAttemptsData?.attempts || [];

    const completedAttempts = attempts.filter(
      (att) => att.status === "submitted" || att.status === "auto_submitted"
    ).length;

    const totalSeconds = attempts.reduce(
      (sum, att) => sum + (att.time_spent_seconds || 0),
      0
    );
    const learningHours = Math.round(totalSeconds / 3600);

    const completedScores = attempts
      .filter(
        (att) =>
          (att.status === "submitted" || att.status === "auto_submitted") &&
          att.score != null
      )
      .map((att) => att.score);
    const averageScore =
      completedScores.length > 0
        ? Math.round(
            completedScores.reduce((sum, score) => sum + score, 0) /
              completedScores.length
          )
        : 0;

    const totalQuizzes = allQuizzes.length;
    const completedQuizIds = new Set(
      attempts
        .filter(
          (att) => att.status === "submitted" || att.status === "auto_submitted"
        )
        .map((att) => att.quiz_id)
    );
    const completedQuizzes = completedQuizIds.size;

    return {
      totalQuizzes,
      completedQuizzes,
      averageScore,
      learningHours,
      completedAttempts,
    };
  }, [allAttemptsData, allQuizzes]);

  // Get active quizzes (available to take now)
  const activeQuizzes = useMemo(() => {
    const now = new Date();
    return allQuizzes
      .filter((quiz) => {
        if (quiz.status === "cancelled") return false;
        if (quiz.scheduling_enabled && quiz.starts_at && quiz.ends_at) {
          const start = new Date(quiz.starts_at);
          const end = new Date(quiz.ends_at);
          return now >= start && now <= end;
        }
        return quiz.is_available || quiz.status === "active";
      })
      .slice(0, 6);
  }, [allQuizzes]);

  // Get recommended quizzes (not yet completed)
  const recommendedQuizzes = useMemo(() => {
    const attempts = allAttemptsData?.attempts || [];
    const completedQuizIds = new Set(
      attempts
        .filter(
          (att) => att.status === "submitted" || att.status === "auto_submitted"
        )
        .map((att) => att.quiz_id)
    );

    return allQuizzes
      .filter((quiz) => !completedQuizIds.has(quiz.quiz_id || quiz.id))
      .slice(0, 6);
  }, [allQuizzes, allAttemptsData]);

  // Get in-progress quizzes
  const inProgressQuizzes = useMemo(() => {
    const attempts = allAttemptsData?.attempts || [];
    const inProgressAttempts = attempts.filter(
      (att) => att.status === "in_progress"
    );
    const inProgressQuizIds = new Set(
      inProgressAttempts.map((att) => att.quiz_id)
    );

    return allQuizzes
      .filter((quiz) => inProgressQuizIds.has(quiz.quiz_id || quiz.id))
      .slice(0, 3);
  }, [allQuizzes, allAttemptsData]);

  // Recent activity timeline
  const recentActivity = useMemo(() => {
    const attempts = allAttemptsData?.attempts || [];
    return attempts
      .filter((att) => att.status === "submitted" || att.status === "auto_submitted")
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
      .slice(0, 5)
      .map((att) => {
        const quiz = allQuizzes.find(
          (q) => (q.quiz_id || q.id) === att.quiz_id
        );
        return {
          title: quiz?.title || "Quiz Completed",
          description: `Scored ${att.score}% with ${
            att.correct_answers || 0
          } correct answers`,
          status: "completed",
          date: att.submitted_at,
          metadata: {
            score: att.score,
            duration: att.time_spent_seconds
              ? `${Math.round(att.time_spent_seconds / 60)} min`
              : null,
          },
        };
      });
  }, [allAttemptsData, allQuizzes]);

  if (allQuizzesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <p className="text-emerald-600 font-semibold mb-2">
                Welcome back
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {user?.name || "Student"}
              </h1>
              <p className="text-lg text-gray-600 mb-6 max-w-xl">
                Continue your PMP certification journey. Track your progress,
                join study groups, and ace your exams.
              </p>
              <div className="flex flex-wrap gap-4">
                {activeQuizzes.length > 0 && (
                  <button
                    onClick={() =>
                      navigate(
                        `/exams/${
                          activeQuizzes[0]?.quiz_id || activeQuizzes[0]?.id
                        }`
                      )
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Play className="w-5 h-5 text-white" />
                    Start Practice Exam
                  </button>
                )}
                <button
                  onClick={() => navigate("/groups")}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  Browse Groups
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 lg:gap-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {dashboardStats.totalQuizzes}
                </div>
                <div className="text-sm text-gray-600">Available Exams</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {dashboardStats.completedQuizzes}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600">
                  {dashboardStats.averageScore}%
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Overview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {/* Progress Bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Completion
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  {dashboardStats.totalQuizzes > 0
                    ? Math.round(
                        (dashboardStats.completedQuizzes /
                          dashboardStats.totalQuizzes) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      dashboardStats.totalQuizzes > 0
                        ? Math.round(
                            (dashboardStats.completedQuizzes /
                              dashboardStats.totalQuizzes) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {dashboardStats.completedQuizzes} of{" "}
                {dashboardStats.totalQuizzes} exams completed
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {dashboardStats.learningHours}h
                  </div>
                  <div className="text-xs text-gray-600">Study Time</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {dashboardStats.completedAttempts}
                  </div>
                  <div className="text-xs text-gray-600">Total Attempts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Learning Section */}
      {inProgressQuizzes.length > 0 && (
        <section className="bg-emerald-50 border-y border-emerald-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Continue Where You Left Off
              </h2>
            </div>
            <div className="space-y-4">
              {inProgressQuizzes.map((quiz) => (
                <div
                  key={quiz.quiz_id || quiz.id}
                  onClick={() => navigate(`/exams/${quiz.quiz_id || quiz.id}`)}
                  className="flex items-center justify-between bg-white rounded-lg p-5 border border-emerald-200 cursor-pointer hover:border-emerald-400 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {quiz.question_count > 0 && (
                        <span>{quiz.question_count} questions</span>
                      )}
                      {quiz.duration_minutes > 0 && (
                        <span>{quiz.duration_minutes} min</span>
                      )}
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                    <Play className="w-4 h-4 text-white" />
                    Continue
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Exams Section */}
      {recommendedQuizzes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Recommended Exams
              </h2>
              <p className="text-gray-600">Based on your learning progress</p>
            </div>
            <Link
              to="/my-learning"
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recommendedQuizzes.slice(0, 5).map((quiz, index) => (
              <div
                key={quiz.quiz_id || quiz.id}
                onClick={() => navigate(`/exams/${quiz.quiz_id || quiz.id}`)}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {quiz.question_count > 0 && (
                      <span>{quiz.question_count} questions</span>
                    )}
                    {quiz.duration_minutes > 0 && (
                      <span>• {quiz.duration_minutes} min</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two Column Layout: Groups & Activity */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Study Groups */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Study Groups
                  </h2>
                </div>
                <Link
                  to="/groups"
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                >
                  View all
                </Link>
              </div>

              {myGroups.length > 0 ? (
                <div className="space-y-3">
                  {myGroups.slice(0, 4).map((group) => (
                    <div
                      key={group.group_id || group.id}
                      onClick={() =>
                        navigate(`/groups/${group.group_id || group.id}`)
                      }
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-lg">
                        {group.name?.[0]?.toUpperCase() || "G"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {group.member_count || 0} members
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          group.is_private
                            ? "bg-gray-100 text-gray-600"
                            : "bg-green-100 text-green-700"
                        )}
                      >
                        {group.is_private ? "Private" : "Public"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">
                    You haven't joined any groups yet
                  </p>
                  <button
                    onClick={() => navigate("/groups")}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Browse Groups →
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Activity
                </h2>
              </div>

              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 4).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg"
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                          activity.metadata?.score >= 80
                            ? "bg-green-100"
                            : activity.metadata?.score >= 60
                            ? "bg-orange-100"
                            : "bg-gray-100"
                        )}
                      >
                        <Trophy
                          className={cn(
                            "w-5 h-5",
                            activity.metadata?.score >= 80
                              ? "text-green-600"
                              : activity.metadata?.score >= 60
                              ? "text-orange-600"
                              : "text-gray-500"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "text-lg font-bold",
                          activity.metadata?.score >= 80
                            ? "text-green-600"
                            : activity.metadata?.score >= 60
                            ? "text-orange-600"
                            : "text-gray-600"
                        )}
                      >
                        {activity.metadata?.score}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No recent activity yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete your first exam to see activity here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Active Exams Banner */}
      {activeQuizzes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-emerald-600 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white opacity-90">
                    Active Now
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-white">
                  {activeQuizzes.length} Exams Available
                </h2>
                <p className="text-white opacity-90">
                  Practice exams ready for you to take right now
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(
                    `/exams/${
                      activeQuizzes[0]?.quiz_id || activeQuizzes[0]?.id
                    }`
                  )
                }
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0"
              >
                Start Now
                <ArrowRight className="w-5 h-5 text-emerald-600" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <Award className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About PMP Exam Platform
            </h2>
            <p className="text-gray-600 mb-6">
              Our platform is designed to help you prepare for your PMP
              certification exam with confidence. Practice with real exam-style
              questions, track your progress, and study with peers in groups.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-emerald-600">
                  {dashboardStats.totalQuizzes}+
                </div>
                <div className="text-sm text-gray-600">Practice Exams</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">
                  {myGroups.length}
                </div>
                <div className="text-sm text-gray-600">Study Groups</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">24/7</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
