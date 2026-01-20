import { useState, useEffect, useMemo } from "react";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Grid3X3,
  List,
  Search,
} from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Enhanced Question Navigator Component
 * Handles large question sets with pagination and multiple view modes
 */
const QuestionNavigator = ({
  questions,
  currentQuestion,
  currentQuestionIndex,
  onNavigate,
  progress,
}) => {
  const QUESTIONS_PER_PAGE = 20; // Questions per page in grid view
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'compact' | 'list'
  const [currentPage, setCurrentPage] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const showPagination = questions.length > QUESTIONS_PER_PAGE;

  // Auto-navigate to the page containing the current question
  useEffect(() => {
    const pageOfCurrentQuestion = Math.floor(
      currentQuestionIndex / QUESTIONS_PER_PAGE
    );
    setCurrentPage(pageOfCurrentQuestion);
  }, [currentQuestionIndex]);

  // Get questions for current page
  const paginatedQuestions = useMemo(() => {
    if (!showPagination) return questions;
    const start = currentPage * QUESTIONS_PER_PAGE;
    const end = start + QUESTIONS_PER_PAGE;
    return questions.slice(start, end);
  }, [questions, currentPage, showPagination]);

  // Calculate the starting index for the current page
  const pageStartIndex = currentPage * QUESTIONS_PER_PAGE;

  // Progress percentage
  const progressPercentage =
    ((progress?.answered_count || 0) / (progress?.total_questions || 1)) * 100;

  // Handle search/jump to question
  const handleJumpToQuestion = (e) => {
    e.preventDefault();
    const num = parseInt(searchValue, 10);
    if (num >= 1 && num <= questions.length) {
      onNavigate(num);
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  // Page navigation handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  const renderQuestionButton = (q, idx, actualIndex) => {
    const isCurrent = q.quiz_question_id === currentQuestion?.quiz_question_id;
    const isFlagged = q.is_flagged;
    const isAnswered = q.is_answered;
    const isAhead = actualIndex > currentQuestionIndex;
    const isDisabled = isAhead && !isAnswered && !isFlagged;

    if (viewMode === "compact") {
      return (
        <button
          key={q.quiz_question_id}
          onClick={() => onNavigate(actualIndex + 1)}
          disabled={isDisabled}
          title={`Question ${actualIndex + 1}${isFlagged ? " (Flagged)" : ""}${
            isAnswered ? " (Answered)" : ""
          }`}
          className={cn(
            "relative w-6 h-6 rounded text-xs font-medium transition-all duration-150",
            isCurrent
              ? "bg-[#6EC1E4] text-white shadow-md scale-110 z-10"
              : isFlagged
              ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
              : isAnswered
              ? "bg-[rgba(110,193,228,0.2)] text-[#5AAFD0] hover:bg-[rgba(110,193,228,0.3)]"
              : isDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {actualIndex + 1}
          {isFlagged && !isCurrent && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
          )}
        </button>
      );
    }

    if (viewMode === "list") {
      return (
        <button
          key={q.quiz_question_id}
          onClick={() => onNavigate(actualIndex + 1)}
          disabled={isDisabled}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all duration-150",
            isCurrent
              ? "bg-[#6EC1E4] text-white shadow-md"
              : isFlagged
              ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
              : isAnswered
              ? "bg-[rgba(110,193,228,0.1)] text-[#5AAFD0] hover:bg-[rgba(110,193,228,0.2)]"
              : isDisabled
              ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          )}
        >
          <span
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0",
              isCurrent
                ? "bg-white/20 text-white"
                : isFlagged
                ? "bg-orange-200 text-orange-700"
                : isAnswered
                ? "bg-[rgba(110,193,228,0.2)] text-[#5AAFD0]"
                : "bg-gray-200 text-gray-600"
            )}
          >
            {actualIndex + 1}
          </span>
          <span className="flex-1 text-sm font-medium truncate">
            Question {actualIndex + 1}
          </span>
          <div className="flex items-center gap-1.5">
            {isFlagged && (
              <Flag className="w-3.5 h-3.5 text-orange-500" fill="currentColor" />
            )}
            {isAnswered && !isCurrent && (
              <span className="w-2 h-2 rounded-full bg-[#6EC1E4]" />
            )}
          </div>
        </button>
      );
    }

    // Default grid view
    return (
      <button
        key={q.quiz_question_id}
        onClick={() => onNavigate(actualIndex + 1)}
        disabled={isDisabled}
        className={cn(
          "relative w-full aspect-square rounded-lg font-semibold text-sm transition-all duration-200",
          isCurrent
            ? "bg-[#6EC1E4] text-white shadow-lg shadow-[#6EC1E4]/30 scale-110 z-10"
            : isFlagged
            ? "bg-orange-100 text-orange-700 hover:bg-orange-200 ring-2 ring-orange-300"
            : isAnswered
            ? "bg-[rgba(110,193,228,0.15)] text-[#5AAFD0] hover:bg-[rgba(110,193,228,0.3)]"
            : isDisabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        {actualIndex + 1}
        {isFlagged && !isCurrent && (
          <Flag
            className="absolute -top-1 -right-1 w-3 h-3 text-orange-600"
            fill="currentColor"
          />
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24">
      {/* Navigator Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Question Navigator</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {questions.length} questions total
            </p>
          </div>

          {/* View Mode Toggle & Search */}
          <div className="flex items-center gap-1">
            {/* Quick Jump Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                searchOpen
                  ? "bg-[#6EC1E4] text-white"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              )}
              title="Jump to question"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* View Mode Buttons */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 ml-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
                title="Grid view"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "compact"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
                title="Compact view"
              >
                <span className="text-[10px] font-bold">123</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Jump Search */}
        {searchOpen && (
          <form onSubmit={handleJumpToQuestion} className="mt-3">
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={questions.length}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={`Enter 1-${questions.length}`}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EC1E4] focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                disabled={
                  !searchValue ||
                  parseInt(searchValue) < 1 ||
                  parseInt(searchValue) > questions.length
                }
                className="px-4 py-2 bg-[#6EC1E4] text-white text-sm font-medium rounded-lg hover:bg-[#5AAFD0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Go
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Question Grid/List */}
      <div
        className={cn(
          "p-4",
          viewMode === "list" && "max-h-[320px] overflow-y-auto"
        )}
      >
        {/* Pagination Info */}
        {showPagination && viewMode !== "list" && (
          <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
            <span>
              Showing {pageStartIndex + 1}-
              {Math.min(pageStartIndex + QUESTIONS_PER_PAGE, questions.length)}
            </span>
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        )}

        {/* Question Buttons */}
        <div
          className={cn(
            viewMode === "grid" && "grid grid-cols-5 gap-2",
            viewMode === "compact" && "flex flex-wrap gap-1.5",
            viewMode === "list" && "flex flex-col gap-1.5"
          )}
        >
          {paginatedQuestions.map((q, idx) => {
            const actualIndex = showPagination ? pageStartIndex + idx : idx;
            return renderQuestionButton(q, idx, actualIndex);
          })}
        </div>

        {/* Pagination Controls */}
        {showPagination && viewMode !== "list" && (
          <div className="flex items-center justify-center gap-1 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
                // Show first, last, current, and adjacent pages
                const showPage =
                  page === 0 ||
                  page === totalPages - 1 ||
                  Math.abs(page - currentPage) <= 1;

                // Show ellipsis
                const showEllipsisBefore =
                  page === currentPage - 2 && currentPage > 2;
                const showEllipsisAfter =
                  page === currentPage + 2 && currentPage < totalPages - 3;

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <span key={page} className="px-1 text-gray-400">
                      •••
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-xs font-medium transition-colors",
                      page === currentPage
                        ? "bg-[#6EC1E4] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {page + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#6EC1E4]" />
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[rgba(110,193,228,0.2)] border border-[rgba(110,193,228,0.3)]" />
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
            <span className="text-gray-600">Unanswered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-100 ring-1 ring-orange-300" />
            <span className="text-gray-600">Flagged</span>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="px-5 py-4 border-t border-gray-100 rounded-b-xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-bold text-gray-900">
              {progress?.answered_count || 0} / {progress?.total_questions || 0}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6EC1E4] rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center p-2 bg-[rgba(110,193,228,0.1)] rounded-lg">
              <div className="text-lg font-bold text-[#5AAFD0]">
                {progress?.answered_count || 0}
              </div>
              <div className="text-xs text-[#6EC1E4]">Done</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-700">
                {progress?.unanswered_count || 0}
              </div>
              <div className="text-xs text-gray-500">Left</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-700">
                {progress?.flagged_count || 0}
              </div>
              <div className="text-xs text-orange-600">Flagged</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;