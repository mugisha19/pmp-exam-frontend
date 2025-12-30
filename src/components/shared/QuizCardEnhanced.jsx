/**
 * QuizCardEnhanced Component
 * Enhanced quiz card with attempt history, stats, and countdown
 */

import { BookOpen, Clock, Trophy, Globe, Users, Play, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { CountdownTimer } from "./CountdownTimer";
import { AttemptBadge } from "./AttemptBadge";

export const QuizCardEnhanced = ({
  quiz,
  attemptInfo = null,
  onStart,
  onView,
  onViewAttempts,
  className,
  view = "grid", // "grid" or "list"
}) => {
  const quizId = quiz?.quiz_id || quiz?.id;
  const isPublic = quiz?.is_public && !quiz?.group_id;
  const isScheduled = quiz?.scheduling_enabled && quiz?.starts_at;
  const isActive = quiz?.is_available || quiz?.status === "active";
  const isCompleted = quiz?.status === "completed";
  const isCancelled = quiz?.status === "cancelled";

  const attempts = attemptInfo?.attempts || 0;
  const bestScore = attemptInfo?.best_score || null;
  const lastAttemptDate = attemptInfo?.last_attempt_date || null;
  const maxAttempts = quiz?.max_attempts || null;

  const canStart = isActive && !isCompleted && !isCancelled && (!maxAttempts || attempts < maxAttempts);

  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-error/10 text-error rounded-full text-xs font-medium">
          Cancelled
        </span>
      );
    }

    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          Completed
        </span>
      );
    }

    if (isScheduled) {
      const now = new Date();
      const startDate = new Date(quiz.starts_at);
      const endDate = new Date(quiz.ends_at);

      if (now > endDate) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            Ended
          </span>
        );
      }

      if (now >= startDate && now <= endDate) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(71, 96, 114, 0.1)', color: '#476072' }}>
            <Play className="w-3 h-3" />
            Active
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(71, 96, 114, 0.1)', color: '#476072' }}>
          <Calendar className="w-3 h-3" />
          Scheduled
        </span>
      );
    }

    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(71, 96, 114, 0.1)', color: '#476072' }}>
          <Play className="w-3 h-3" />
          Available
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
        Not Available
      </span>
    );
  };

  if (view === "list") {
    return (
      <div
        onClick={() => onView?.(quizId)}
        className={cn(
          "bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer group",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {isPublic ? (
                <Globe className="w-5 h-5 flex-shrink-0" style={{ color: '#476072' }} />
              ) : (
                <Users className="w-5 h-5 flex-shrink-0" style={{ color: '#476072' }} />
              )}
              <h3 className="text-lg font-semibold text-gray-900 transition-colors line-clamp-1" style={{ '--hover-color': '#476072' }} onMouseEnter={(e) => e.currentTarget.style.color = '#476072'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                {quiz?.title}
              </h3>
              {getStatusBadge()}
            </div>

            {quiz?.description && (
              <div
                className="text-sm text-gray-600 line-clamp-2 mb-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: quiz.description }}
              />
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{quiz?.total_questions || quiz?.question_count || 0} questions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{quiz?.time_limit_minutes || quiz?.time_limit || 0} min</span>
              </div>
              {quiz?.passing_score && (
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>{quiz.passing_score}% passing</span>
                </div>
              )}
            </div>

            <AttemptBadge
              attempts={attempts}
              bestScore={bestScore}
              lastAttemptDate={lastAttemptDate}
              maxAttempts={maxAttempts}
            />

            {isScheduled && !isActive && (
              <div className="mt-3">
                <CountdownTimer targetDate={quiz.starts_at} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {canStart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart?.(quizId);
                }}
                className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: '#476072' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a4d5c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#476072'}
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            )}
            {attempts > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAttempts?.(quizId);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Attempts
              </button>
            )}
            <div className="p-2 bg-gray-50 rounded-lg transition-colors" style={{ '--hover-bg': 'rgba(71, 96, 114, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(71, 96, 114, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
              <ArrowRight className="w-5 h-5 text-gray-400 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#476072'} onMouseLeave={(e) => e.currentTarget.style.color = ''} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={() => onView?.(quizId)}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col h-full",
        className
      )}
    >
      {/* Header with gradient */}
      <div className="relative h-24 flex-shrink-0" style={{ background: 'linear-gradient(to right, rgba(71, 96, 114, 0.1), rgba(71, 96, 114, 0.05))' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(71, 96, 114, 0.05), transparent)' }} />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isPublic ? (
            <Globe className="w-4 h-4" style={{ color: '#476072' }} />
          ) : (
            <Users className="w-4 h-4" style={{ color: '#476072' }} />
          )}
          {getStatusBadge()}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-base font-semibold text-gray-900 transition-colors line-clamp-2" onMouseEnter={(e) => e.currentTarget.style.color = '#476072'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>
            {quiz?.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-h-0">
        {quiz?.description && (
          <div
            className="text-sm text-gray-600 line-clamp-2 mb-3 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: quiz.description }}
          />
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{quiz?.total_questions || quiz?.question_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{quiz?.time_limit_minutes || quiz?.time_limit || 0}m</span>
          </div>
          {quiz?.passing_score && (
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>{quiz.passing_score}%</span>
            </div>
          )}
        </div>

        <AttemptBadge
          attempts={attempts}
          bestScore={bestScore}
          lastAttemptDate={lastAttemptDate}
          maxAttempts={maxAttempts}
          className="mb-3"
        />

        {isScheduled && !isActive && (
          <div className="mb-3">
            <CountdownTimer targetDate={quiz.starts_at} />
          </div>
        )}

        {/* Spacer to push actions to bottom */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-200 mt-auto">
          {canStart ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStart?.(quizId);
              }}
              className="flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: '#476072' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a4d5c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#476072'}
            >
              <Play className="w-4 h-4" />
              Start Quiz
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView?.(quizId);
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCardEnhanced;

