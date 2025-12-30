/**
 * SearchBar Component
 * Prominent search bar for dashboard with autocomplete suggestions
 */

import { Search, Filter, BookOpen, Users, ArrowRight, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/utils/cn";

export const SearchBar = ({ 
  placeholder = "Search your courses/quizzes here...", 
  onSearch,
  onFilterClick,
  className,
  value: controlledValue,
  onChange,
  suggestions = [],
  onSuggestionClick
}) => {
  const [searchValue, setSearchValue] = useState(controlledValue || "");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== searchValue) {
      setSearchValue(controlledValue);
    }
  }, [controlledValue, searchValue]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onChange?.(newValue);
    onSearch?.(newValue);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSuggestionClick(suggestions[selectedIndex]);
    } else {
      onSearch?.(searchValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setIsFocused(false);
    setSearchValue(suggestion.title || suggestion.name);
    onChange?.(suggestion.title || suggestion.name);
    
    // Notify parent that a suggestion was clicked
    onSuggestionClick?.(suggestion);
    
    // Navigate to the selected item
    if (suggestion.type === "quiz") {
      window.location.href = `/exams/${suggestion.id}`;
    } else if (suggestion.type === "group") {
      window.location.href = `/groups/${suggestion.id}`;
    }
  };

  const handleKeyDown = (e) => {
    if (!isFocused || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
  };

  const showSuggestions = isFocused && searchValue.trim().length > 0 && suggestions.length > 0;
  const displayedSuggestions = suggestions.slice(0, 8);

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-12 py-3 rounded-xl",
            "bg-white border-2 border-gray-200",
            "text-gray-900 placeholder:text-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
            "hover:border-gray-300 shadow-sm hover:shadow-md",
            showSuggestions && "rounded-b-none"
          )}
        />
        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
          >
            <Filter className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-b-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
        >
          <div className="p-2">
            {displayedSuggestions.map((suggestion, index) => {
              const isSelected = index === selectedIndex;
              const Icon = suggestion.type === "quiz" ? BookOpen : Users;
              
              return (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                    isSelected 
                      ? "bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-2 border-purple-500/20" 
                      : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                    suggestion.type === "quiz"
                      ? "bg-gradient-to-br from-blue-100 to-blue-200"
                      : "bg-gradient-to-br from-purple-100 to-purple-200"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      suggestion.type === "quiz" ? "text-blue-600" : "text-purple-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {suggestion.title || suggestion.name}
                    </p>
                    {suggestion.type === "quiz" && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-medium">
                          {suggestion.total_questions || 0} questions
                        </span>
                        {suggestion.time_limit_minutes && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {suggestion.time_limit_minutes} min
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    {suggestion.type === "group" && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-medium">
                          {suggestion.member_count || 0} members
                        </span>
                        {suggestion.quiz_count > 0 && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 font-medium">
                              {suggestion.quiz_count} quizzes
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

