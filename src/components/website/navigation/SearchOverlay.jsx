/**
 * SearchOverlay Component
 * Full-screen search interface
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Clock, TrendingUp, BookOpen, Users } from "lucide-react";
import { cn } from "@/utils/cn";
import { getQuizzes } from "@/services/quiz.service";
import { getGroups } from "@/services/group.service";

export const SearchOverlay = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);

  const { data: quizzesData } = useQuery({
    queryKey: ["search-quizzes"],
    queryFn: () => getQuizzes(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: groupsData } = useQuery({
    queryKey: ["search-groups"],
    queryFn: () => getGroups(),
    staleTime: 5 * 60 * 1000,
  });

  const quizzes = quizzesData?.quizzes || quizzesData?.items || [];
  const groups = groupsData?.groups || groupsData?.items || [];

  const filteredQuizzes = searchQuery
    ? quizzes
        .filter(
          (quiz) =>
            quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const filteredGroups = searchQuery
    ? groups
        .filter(
          (group) =>
            group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const recentSearches = ["PMP Practice Exam", "Agile Quiz", "Study Group"];

  useEffect(() => {
    inputRef.current?.focus();

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleResultClick = (type, id) => {
    if (type === "quiz") {
      navigate(`/exams/${id}`);
    } else if (type === "group") {
      navigate(`/groups/${id}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 pt-20">
        <div className="max-w-3xl mx-auto">
          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-5 border-b border-border-light">
              <Search className="w-6 h-6 text-text-tertiary flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exams, groups, resources..."
                className="flex-1 text-lg outline-none placeholder:text-text-muted"
              />
              <button
                onClick={onClose}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-tertiary" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!searchQuery ? (
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-3">
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(search)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-bg-secondary rounded-lg transition-colors"
                      >
                        <Clock className="w-5 h-5 text-text-muted" />
                        <span className="text-text-secondary">{search}</span>
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mt-6 mb-3">
                    Popular
                  </h3>
                  <div className="space-y-2">
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-bg-secondary rounded-lg transition-colors">
                      <TrendingUp className="w-5 h-5 text-primary-500" />
                      <span className="text-text-secondary">
                        PMP Full Practice Test
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Quizzes Results */}
                  {filteredQuizzes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Exams
                      </h3>
                      <div className="space-y-2">
                        {filteredQuizzes.map((quiz) => (
                          <button
                            key={quiz.quiz_id || quiz.id}
                            onClick={() =>
                              handleResultClick("quiz", quiz.quiz_id || quiz.id)
                            }
                            className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-primary-50 rounded-lg transition-colors group"
                          >
                            <BookOpen className="w-5 h-5 text-text-muted group-hover:text-primary-600 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-text-primary group-hover:text-primary-600">
                                {quiz.title}
                              </div>
                              {quiz.description && (
                                <div className="text-sm text-text-tertiary line-clamp-1 mt-0.5">
                                  {quiz.description}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Groups Results */}
                  {filteredGroups.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Groups
                      </h3>
                      <div className="space-y-2">
                        {filteredGroups.map((group) => (
                          <button
                            key={group.group_id || group.id}
                            onClick={() =>
                              handleResultClick(
                                "group",
                                group.group_id || group.id
                              )
                            }
                            className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-primary-50 rounded-lg transition-colors group"
                          >
                            <Users className="w-5 h-5 text-text-muted group-hover:text-primary-600 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-text-primary group-hover:text-primary-600">
                                {group.name}
                              </div>
                              {group.description && (
                                <div className="text-sm text-text-tertiary line-clamp-1 mt-0.5">
                                  {group.description}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {filteredQuizzes.length === 0 &&
                    filteredGroups.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-text-secondary mb-1">
                          No results found
                        </h3>
                        <p className="text-text-tertiary">
                          Try searching with different keywords
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-4 px-6 text-center text-sm text-white/60">
            Press <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> to
            close
          </div>
        </div>
      </div>
    </div>
  );
};
