/**
 * ProfileCard Component
 * Right sidebar profile card with greeting and user info
 */

import { useAuthStore } from "@/stores/auth.store";
import { Bell, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

export const ProfileCard = ({ className }) => {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Your Profile</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center mb-4">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center border-4 border-white shadow-md">
            <span className="text-white font-bold text-xl">{initials}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-primary rounded-full border-2 border-white"></div>
        </div>
        <h4 className="text-base font-semibold text-gray-900 mb-1">
          {getGreeting()} {user?.first_name}
        </h4>
        <p className="text-xs text-gray-600 text-center">
          Continue Your Journey And Achieve Your Target
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-200">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <MessageSquare className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;

