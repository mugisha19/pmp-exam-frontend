/**
 * Reusable Exam Card Component
 * Modern design with neutral color palette
 */

import {
  BookOpen,
  Clock,
  Trophy,
  CheckCircle,
  ChevronRight,
  Play,
  Zap,
  Target,
  BarChart3,
  Star,
  TrendingUp,
  ArrowRight,
  XCircle,
  Calendar,
} from "lucide-react";
import { cn } from "@/utils/cn";

// Color Constants
const COLORS = {
  primary: "#476072",
  primaryLight: "#5a7a8f",
  primaryDark: "#3a5060",
  accent: "#E7F2EF",
  accentDark: "#d4e8e3",
};

export const ExamCard = ({
  quiz,
  bestScore,
  attemptCount = 0,
  onClick,
  variant = "grid",
  className,
  onSetReminder,
}) => {
  const isCompleted = quiz.status === "completed";
  const isActive = quiz.is_available || quiz.status === "active";
  const isCancelled = quiz.status === "cancelled";
  const isPremium = quiz.is_premium;
  const difficulty = quiz.difficulty || "medium";

  const getDifficultyConfig = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return {
          label: "Easy",
          bg: "bg-teal-50",
          text: "text-teal-700",
          border: "border-teal-200",
        };
      case "hard":
        return {
          label: "Hard",
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200",
        };
      default:
        return {
          label: "Medium",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
        };
    }
  };

  const difficultyConfig = getDifficultyConfig(difficulty);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-teal-600";
    if (score >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-teal-50 border-teal-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };

  // List Variant
  if (variant === "list") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "group relative flex items-center gap-5 p-5 bg-white border border-gray-200 rounded-2xl",
          "hover:shadow-lg hover:border-gray-300",
          "transition-all duration-300 cursor-pointer",
          className
        )}
        style={{
          "--hover-bg": COLORS.accent,
        }}
      >
        {/* Left Accent */}
        <div
          className="absolute left-0 top-4 bottom-4 w-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: COLORS.primary }}
        />

        {/* Icon */}
        <div
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-105 transition-all"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
          }}
        >
          <BookOpen className="w-7 h-7" />
          {attemptCount > 0 && (
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border-2"
              style={{ borderColor: COLORS.accent }}
            >
              <TrendingUp
                className="w-3.5 h-3.5"
                style={{ color: COLORS.primary }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900 truncate transition-colors group-hover:text-gray-700">
              {quiz.title}
            </h3>

            {/* Badges */}
            <div className="flex items-center gap-2">
              {isCancelled && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
                  <XCircle className="w-3 h-3" />
                  Cancelled
                </span>
              )}
              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-lg border border-teal-200">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </span>
              )}
              {isActive && !isCompleted && !isCancelled && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border"
                  style={{
                    backgroundColor: COLORS.accent,
                    color: COLORS.primary,
                    borderColor: COLORS.accentDark,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: COLORS.primary }}
                  />
                  Active
                </span>
              )}
              {isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200">
                  <Star className="w-3 h-3" />
                  Pro
                </span>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-gray-600">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="font-medium">
                {quiz.total_questions || 0} questions
              </span>
            </span>
            {quiz.time_limit_minutes && (
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {quiz.time_limit_minutes} min
                </span>
              </span>
            )}
            {bestScore !== null && bestScore !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-bold",
                  getScoreColor(bestScore)
                )}
              >
                <Trophy className="w-4 h-4" />
                Best: {Math.round(bestScore)}%
              </span>
            )}
            {attemptCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-gray-500">
                <BarChart3 className="w-4 h-4" />
                {attemptCount} attempt{attemptCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
          }}
        >
          {attemptCount > 0 ? (
            <>
              <Play className="w-4 h-4" />
              Continue
            </>
          ) : (
            <>
              Start Exam
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  }

  // Grid Variant (Default)
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-white border border-gray-200 rounded-2xl overflow-hidden",
        "hover:shadow-xl hover:border-gray-300",
        "transition-all duration-300 cursor-pointer flex flex-col h-full",
        className
      )}
    >
      {/* Header */}
      <div
        className="relative h-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16" />
        </div>

        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Status Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPremium && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400/90 backdrop-blur-sm text-amber-900 text-xs font-semibold rounded-lg">
                <Star className="w-3 h-3" />
                Pro
              </span>
            )}
          </div>

          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-teal-700 rounded-lg text-xs font-semibold shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              Done
            </div>
          ) : isCancelled ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-red-700 rounded-lg text-xs font-semibold shadow-sm">
              <XCircle className="w-3.5 h-3.5" />
              Cancelled
            </div>
          ) : isActive ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-semibold shadow-sm"
              style={{ color: COLORS.primary }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: COLORS.primary }}
              />
              Active
            </div>
          ) : null}
        </div>

        {/* Best Score Badge */}
        {bestScore !== null && bestScore !== undefined && (
          <div className="absolute bottom-3 left-3">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-sm bg-white/90",
                getScoreBg(bestScore)
              )}
            >
              <Trophy className={cn("w-4 h-4", getScoreColor(bestScore))} />
              <div>
                <div className="text-[10px] text-gray-600 font-medium leading-none">
                  Best
                </div>
                <div
                  className={cn(
                    "text-sm font-bold leading-tight",
                    getScoreColor(bestScore)
                  )}
                >
                  {Math.round(bestScore)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attempt Count */}
        {attemptCount > 0 && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-xl text-xs font-semibold text-gray-700 shadow-sm">
              <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
              {attemptCount} attempt{attemptCount !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors leading-snug">
          {quiz.title}
        </h3>

        {/* Description */}
        {quiz.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
            {quiz.description.replace(/<[^>]*>/g, "")}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
            style={{ backgroundColor: COLORS.accent }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "white" }}
            >
              <BookOpen className="w-4 h-4" style={{ color: COLORS.primary }} />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                Questions
              </div>
              <div className="text-sm font-bold text-gray-900">
                {quiz.total_questions || 0}
              </div>
            </div>
          </div>

          {quiz.time_limit_minutes && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
              style={{ backgroundColor: COLORS.accent }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "white" }}
              >
                <Clock className="w-4 h-4" style={{ color: COLORS.primary }} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                  Duration
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {quiz.time_limit_minutes}m
                </div>
              </div>
            </div>
          )}

          {quiz.passing_score && !quiz.time_limit_minutes && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
              style={{ backgroundColor: COLORS.accent }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "white" }}
              >
                <Target className="w-4 h-4" style={{ color: COLORS.primary }} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                  Pass
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {quiz.passing_score}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto flex gap-2">
          {onSetReminder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetReminder(quiz.quiz_id || quiz.id);
              }}
              className="p-3 rounded-xl font-semibold text-sm transition-all duration-200 border shadow-sm hover:shadow-md"
              style={{ borderColor: COLORS.primary, color: COLORS.primary }}
              title="Set Reminder"
            >
              <Calendar className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:opacity-90 group-hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
            }}
          >
            {attemptCount > 0 ? (
              <>
                <Play className="w-4 h-4" />
                Continue Exam
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Start Exam
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact Exam Card Variant
 */
export const ExamCardCompact = ({
  quiz,
  bestScore,
  attemptCount = 0,
  onClick,
}) => {
  const isActive = quiz.is_available || quiz.status === "active";

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
        }}
      >
        <BookOpen className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-semibold text-gray-900 truncate text-sm group-hover:text-gray-700 transition-colors">
            {quiz.title}
          </h4>
          {isActive && (
            <span
              className="w-2 h-2 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: COLORS.primary }}
            />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{quiz.total_questions || 0} Q</span>
          {quiz.time_limit_minutes && <span>{quiz.time_limit_minutes}m</span>}
          {bestScore !== null && (
            <span className="font-semibold text-teal-600">
              {Math.round(bestScore)}%
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight
        className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-all shrink-0"
        style={{ color: COLORS.primary }}
      />
    </div>
  );
};

/**
 * Featured Exam Card Variant
 */
export const ExamCardFeatured = ({
  quiz,
  bestScore,
  attemptCount = 0,
  onClick,
}) => {
  const isActive = quiz.is_available || quiz.status === "active";

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all"
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
      }}
    >
      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative p-6 flex flex-col md:flex-row md:items-center gap-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <BookOpen className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live Now
              </span>
            )}
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
              Featured
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            {quiz.title}
          </h3>
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {quiz.total_questions || 0} questions
            </span>
            {quiz.time_limit_minutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {quiz.time_limit_minutes} min
              </span>
            )}
            {bestScore !== null && (
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Trophy className="w-4 h-4 text-amber-300" />
                Best: {Math.round(bestScore)}%
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          style={{ color: COLORS.primary }}
        >
          {attemptCount > 0 ? (
            <>
              <Play className="w-5 h-5" />
              Continue
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Start Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * Minimal Exam Card Variant
 */
export const ExamCardMinimal = ({
  quiz,
  bestScore,
  attemptCount = 0,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700 transition-colors line-clamp-1 flex-1 pr-2">
          {quiz.title}
        </h4>
        {bestScore !== null && (
          <span className="text-xs font-bold text-teal-600 shrink-0">
            {Math.round(bestScore)}%
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {quiz.total_questions || 0}
          </span>
          {quiz.time_limit_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {quiz.time_limit_minutes}m
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-white"
          style={{ backgroundColor: COLORS.primary }}
        >
          {attemptCount > 0 ? "Continue" : "Start"}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ExamCard;
