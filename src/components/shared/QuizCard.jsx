/**
 * QuizCard Component
 * Card for quiz/exam in continue watching section
 */

import { BookOpen, Play } from "lucide-react";
import { cn } from "@/utils/cn";
import { useNavigate } from "react-router-dom";

export const QuizCard = ({ 
  quiz,
  category = "FRONTEND",
  instructor = null,
  progress = 0,
  className 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (quiz?.quiz_id || quiz?.id) {
      navigate(`/exams/${quiz.quiz_id || quiz.id}`);
    }
  };

  const getInitials = (name) => {
    if (!name) return "IN";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group min-w-[280px]",
        className
      )}
    >
      {/* Thumbnail Placeholder */}
      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <BookOpen className="w-12 h-12 text-gray-400" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-accent-primary transition-colors">
          {quiz?.title || "Quiz Title"}
        </h3>
        
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-accent-primary/10 text-accent-primary">
            {category}
          </span>
        </div>

        {/* Instructor Info */}
        {instructor && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">
                {getInitials(instructor.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{instructor.name}</p>
              {instructor.role && (
                <p className="text-xs text-gray-500 truncate">{instructor.role}</p>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;

