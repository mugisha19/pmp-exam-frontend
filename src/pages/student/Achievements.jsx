/**
 * Achievements Page
 * Gamification center with badges and levels
 */

import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Medal,
  TrendingUp,
  Flame,
} from "lucide-react";
import { AchievementBadge } from "@/components/website/cards/AchievementBadge";
import { ProgressRing } from "@/components/website/ui/ProgressRing";

export const Achievements = () => {
  const userLevel = 12;
  const xpCurrent = 850;
  const xpRequired = 1000;
  const xpProgress = (xpCurrent / xpRequired) * 100;

  const achievements = [
    {
      id: 1,
      title: "First Quiz",
      description: "Complete your first practice exam",
      icon: "star",
      unlocked: true,
      date: "2026-01-01",
    },
    {
      id: 2,
      title: "Perfect Score",
      description: "Score 100% on any exam",
      icon: "trophy",
      unlocked: true,
      date: "2025-12-15",
    },
    {
      id: 3,
      title: "Speed Demon",
      description: "Complete exam in under 15 minutes",
      icon: "zap",
      unlocked: true,
      date: "2025-12-20",
    },
    {
      id: 4,
      title: "7-Day Streak",
      description: "Practice for 7 days in a row",
      icon: "medal",
      unlocked: true,
      date: "2025-12-28",
    },
    {
      id: 5,
      title: "Group Leader",
      description: "Create a study group",
      icon: "target",
      unlocked: false,
    },
    {
      id: 6,
      title: "High Achiever",
      description: "Score 90%+ on 10 exams",
      icon: "award",
      unlocked: false,
    },
  ];

  const stats = [
    { label: "Exams Completed", value: "24", icon: Trophy, color: "primary" },
    { label: "Total XP", value: xpCurrent, icon: Star, color: "secondary" },
    {
      label: "Current Streak",
      value: "12 days",
      icon: Flame,
      color: "warning",
    },
    { label: "Rank", value: "#15", icon: TrendingUp, color: "success" },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-gradient-to-br from-secondary-500 to-accent-coral text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Achievements</h1>
          </div>
          <p className="text-xl text-white/90">
            Track your progress and unlock rewards
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Level Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-border-light p-8 mb-8">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-text-primary">
                  Level {userLevel} Student
                </h2>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                  {xpCurrent} XP
                </span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-secondary">
                    Progress to Level {userLevel + 1}
                  </span>
                  <span className="text-sm font-medium text-primary-600">
                    {xpCurrent} / {xpRequired} XP
                  </span>
                </div>
                <div className="h-4 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-text-tertiary">
                {xpRequired - xpCurrent} XP needed to level up
              </p>
            </div>
            <ProgressRing
              progress={xpProgress}
              size={120}
              label="Level Progress"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm border border-border-light p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg bg-${stat.color}-100`}
                  >
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-text-tertiary">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-border-light p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Your Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={achievement.unlocked}
                size="md"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;



