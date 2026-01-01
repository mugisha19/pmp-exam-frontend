/**
 * QuizCardWebsite Component
 * Enhanced quiz card for website layout
 */

import { Link } from "react-router-dom";
import {
  Clock,
  FileQuestion,
  BarChart3,
  Calendar,
  Play,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDistanceToNow } from "date-fns";

export const QuizCardWebsite = ({
  quiz,
  attempts = [],
  className,
  variant = "default",
}) => {
  const quizId = quiz.quiz_id || quiz.id;
  const lastAttempt = attempts && attempts.length > 0 ? attempts[0] : null;
  const bestScore =
    attempts && attempts.length > 0
      ? Math.max(...attempts.map((a) => a.score || 0))
      : null;

  const isScheduled = quiz.scheduling_enabled && quiz.starts_at;
  const isActive = () => {
    if (!quiz.scheduling_enabled)
      return quiz.is_available || quiz.status === "active";
    const now = new Date();
    const start = quiz.starts_at ? new Date(quiz.starts_at) : null;
    const end = quiz.ends_at ? new Date(quiz.ends_at) : null;
    return start && end && now >= start && now <= end;
  };

  return (
    <Link
      to={`/exams/${quizId}`}
      className={cn(
        "group bg-white rounded-xl overflow-hidden shadow-sm border border-border-light hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {/* Image/Header */}
      <div className="relative h-40 bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

        {/* Quiz Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-primary-700">
            {quiz.quiz_type === "public" ? "Public" : "Group"}
          </span>
        </div>

        {/* Status/Score Badge */}
        <div className="absolute top-3 right-3">
          {lastAttempt ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white">
              <CheckCircle2 className="w-3 h-3" />
              {lastAttempt.score}%
            </span>
          ) : isActive() ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white">
              <Play className="w-3 h-3" />
              Active
            </span>
          ) : null}
        </div>

        {/* Difficulty Indicator */}
        <div className="absolute bottom-3 left-3">
          {quiz.difficulty && (
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded backdrop-blur-sm",
                quiz.difficulty === "easy" && "bg-green-500/80 text-white",
                quiz.difficulty === "medium" && "bg-amber-500/80 text-white",
                quiz.difficulty === "hard" && "bg-red-500/80 text-white"
              )}
            >
              {quiz.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-text-primary mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {quiz.title}
        </h3>

        {quiz.description && (
          <p className="text-text-tertiary text-sm line-clamp-2 mb-4">
            {quiz.description}
          </p>
        )}

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border-light">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <FileQuestion className="w-4 h-4" />
            <span>
              {quiz.total_questions || quiz.question_count || 0} questions
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Clock className="w-4 h-4" />
            <span>{quiz.time_limit || quiz.duration || "30"} min</span>
          </div>
        </div>

        {/* Attempts & Stats */}
        <div className="flex items-center justify-between">
          {attempts && attempts.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <div className="font-semibold text-primary-600">
                  {attempts.length}
                </div>
                <div className="text-xs text-text-muted">Attempts</div>
              </div>
              {bestScore !== null && (
                <div className="text-sm">
                  <div className="font-semibold text-success">{bestScore}%</div>
                  <div className="text-xs text-text-muted">Best</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-text-tertiary">No attempts yet</div>
          )}

          {isScheduled && quiz.starts_at && (
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(quiz.starts_at), {
                addSuffix: true,
              })}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button className="mt-4 w-full py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-primary-600 group-hover:text-white">
          {lastAttempt ? "Review & Retake" : "Start Quiz"}
          <Play className="w-4 h-4" />
        </button>
      </div>
    </Link>
  );
};
