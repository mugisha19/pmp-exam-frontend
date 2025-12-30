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
        "bg-gradient-to-br from-white to-gray-50/50 rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow transition-all duration-200 cursor-pointer group min-w-[240px]",
        className
      )}
    >
      {/* Thumbnail Placeholder */}
      <div className="w-full h-32 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(71, 96, 114, 0.15)' }} />
        <BookOpen className="w-10 h-10 text-gray-400 group-hover:text-[#476072] transition-colors duration-200" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2.5 line-clamp-2 transition-colors duration-200 group-hover:text-[#476072]">
          {quiz?.title || "Quiz Title"}
        </h3>
        
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium border" style={{ backgroundColor: 'rgba(71, 96, 114, 0.1)', color: '#476072', borderColor: 'rgba(71, 96, 114, 0.2)' }}>
            {category}
          </span>
        </div>

        {/* Instructor Info */}
        {instructor && (
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#476072' }}>
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
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: '#476072' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;

