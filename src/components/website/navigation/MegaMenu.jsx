/**
 * MegaMenu Component
 * Dropdown menu for Browse section
 */

import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Trophy,
  Target,
  FileQuestion,
  TrendingUp,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/utils/cn";

export const MegaMenu = () => {
  const categories = [
    {
      title: "Exam Categories",
      items: [
        { label: "All Exams", path: "/browse", icon: BookOpen },
        {
          label: "Practice Tests",
          path: "/browse?type=practice",
          icon: FileQuestion,
        },
        { label: "Mock Exams", path: "/browse?type=mock", icon: Trophy },
        { label: "Quick Quizzes", path: "/browse?type=quick", icon: Clock },
      ],
    },
    {
      title: "By Difficulty",
      items: [
        { label: "Beginner", path: "/browse?difficulty=beginner", icon: Star },
        {
          label: "Intermediate",
          path: "/browse?difficulty=intermediate",
          icon: TrendingUp,
        },
        {
          label: "Advanced",
          path: "/browse?difficulty=advanced",
          icon: Target,
        },
        { label: "Expert", path: "/browse?difficulty=expert", icon: Sparkles },
      ],
    },
    {
      title: "Quick Links",
      items: [
        { label: "Learning Paths", path: "/learning-paths", icon: Target },
        { label: "My Learning", path: "/my-learning", icon: TrendingUp },
        { label: "Achievements", path: "/achievements", icon: Trophy },
        { label: "Resources", path: "/resources", icon: BookOpen },
      ],
    },
  ];

  return (
    <div className="absolute top-full left-0 right-0 w-full bg-white border-t border-border-light shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-4">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200 group"
                      >
                        <Icon className="w-5 h-5 text-text-tertiary group-hover:text-primary-600 transition-colors" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
