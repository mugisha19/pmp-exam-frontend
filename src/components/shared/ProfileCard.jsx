/**
 * ProfileCard Component
 * Right sidebar profile card with greeting and user info
 */

import { useAuthStore } from "@/stores/auth.store";
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
    <div className={cn("bg-gradient-to-br from-white via-gray-50/30 to-white rounded-2xl border-2 border-gray-200 shadow-xl shadow-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300", className)}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Your Profile</h3>
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center mb-5">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-accent-primary/10">
            <span className="text-white font-bold text-2xl">{initials}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-3 border-white shadow-lg" style={{ backgroundColor: '#476072' }}></div>
        </div>
        <h4 className="text-lg font-bold text-gray-900 mb-2">
          {getGreeting()} {user?.first_name}
        </h4>
        <p className="text-xs text-gray-600 text-center font-medium leading-relaxed">
          Continue Your Journey And Achieve Your Target
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;

