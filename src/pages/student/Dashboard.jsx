import { useAuthStore } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardList,
  Trophy,
  BookOpen,
  ArrowRight,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const actions = [
    {
      title: "Browse Groups",
      description: "Join study groups and access their quizzes",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      path: "/groups",
    },
    {
      title: "My Exams",
      description: "View and continue your quiz attempts",
      icon: ClipboardList,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      path: "/my-exams",
    },
    {
      title: "Leaderboard",
      description: "See how you rank among other students",
      icon: Trophy,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      path: "/leaderboard",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Continue your PMP certification journey. Practice, learn, and excel.
        </p>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 text-left"
            >
              <div className={`inline-flex p-4 rounded-xl ${action.bgColor} mb-6`}>
                <Icon className={`w-8 h-8 ${action.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 mb-4">{action.description}</p>
              <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                Get Started
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Practice Quizzes</h3>
          </div>
          <p className="text-sm text-gray-600">
            Access quizzes from study groups and improve your knowledge
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Track Progress</h3>
          </div>
          <p className="text-sm text-gray-600">
            Monitor your performance and identify areas for improvement
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Earn Recognition</h3>
          </div>
          <p className="text-sm text-gray-600">
            Compete with peers and climb the leaderboard rankings
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
