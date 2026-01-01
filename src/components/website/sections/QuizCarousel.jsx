/**
 * QuizCarousel Component
 * Horizontal scrollable carousel for quiz cards
 */

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export const QuizCarousel = ({
  title,
  quizzes,
  onQuizClick,
  renderQuizCard,
  className,
}) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (!quizzes || quizzes.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!showLeftArrow}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showLeftArrow
                  ? "bg-white hover:bg-bg-secondary text-text-primary shadow-sm"
                  : "bg-bg-tertiary text-text-muted cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!showRightArrow}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showRightArrow
                  ? "bg-white hover:bg-bg-secondary text-text-primary shadow-sm"
                  : "bg-bg-tertiary text-text-muted cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {quizzes.map((quiz, idx) => (
          <div
            key={quiz.quiz_id || quiz.id || idx}
            className="flex-shrink-0 w-[320px] sm:w-[360px] snap-start"
          >
            {renderQuizCard ? (
              renderQuizCard(quiz)
            ) : (
              <div
                onClick={() => onQuizClick?.(quiz)}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold text-lg text-text-primary mb-2">
                  {quiz.title}
                </h3>
                <p className="text-text-tertiary text-sm line-clamp-2">
                  {quiz.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
