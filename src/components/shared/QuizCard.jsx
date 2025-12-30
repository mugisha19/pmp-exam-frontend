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
        "bg-gradient-to-br from-white to-gray-50/50 rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow transition-all duration-200 cursor-pointer group min-w-[240px] hover:border-teal-300",
        className
      )}
    >
      {/* Thumbnail Placeholder */}
      <div className="w-full h-32 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/15 to-emerald-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <BookOpen className="w-10 h-10 text-gray-400 group-hover:text-teal-600 transition-colors duration-200" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2.5 line-clamp-2 group-hover:text-teal-600 transition-colors duration-200">
          {quiz?.title || "Quiz Title"}
        </h3>
        
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-teal-50 text-teal-600 border border-teal-200">
            {category}
          </span>
        </div>

        {/* Instructor Info */}
        {instructor && (
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-[10px]">
                {getInitials(instructor.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-gray-900 truncate">{instructor.name}</p>
              {instructor.role && (
                <p className="text-[10px] text-gray-500 truncate">{instructor.role}</p>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;

