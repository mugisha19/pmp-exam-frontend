/**
 * SearchBar Component
 * Prominent search bar for dashboard
 */

import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";

export const SearchBar = ({ 
  placeholder = "Search your courses/quizzes here...", 
  onSearch,
  onFilterClick,
  className 
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full pl-12 pr-12 py-3 rounded-xl",
          "bg-white border border-gray-200",
          "text-gray-900 placeholder:text-gray-400",
          "transition-all duration-200",
          "focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20",
          "hover:border-gray-300"
        )}
      />
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Filter className="w-5 h-5" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;

