/**
 * LearningPaths Page
 * Guided study tracks with progress visualization
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, CheckCircle2, Lock, Play, BookOpen } from "lucide-react";
import { ProgressRing } from "@/components/website/ui/ProgressRing";
import { cn } from "@/utils/cn";

export const LearningPaths = () => {
  const navigate = useNavigate();

  // Mock learning paths data - replace with real API call
  const learningPaths = [
    {
      id: 1,
      title: "Initiation",
      description: "Master project initiation concepts and processes",
      progress: 80,
      quizzes: [
        { id: 1, title: "Project Charter", completed: true, score: 92 },
        {
          id: 2,
          title: "Stakeholder Identification",
          completed: true,
          score: 88,
        },
        { id: 3, title: "Business Case", completed: false },
      ],
      unlocked: true,
    },
    {
      id: 2,
      title: "Planning",
      description: "Learn comprehensive project planning techniques",
      progress: 40,
      quizzes: [
        { id: 4, title: "Scope Management", completed: true, score: 85 },
        { id: 5, title: "Schedule Management", completed: false },
        { id: 6, title: "Cost Management", completed: false },
        { id: 7, title: "Quality Planning", completed: false },
      ],
      unlocked: true,
    },
    {
      id: 3,
      title: "Executing",
      description: "Understand project execution and team management",
      progress: 0,
      quizzes: [
        { id: 8, title: "Direct and Manage Work", completed: false },
        { id: 9, title: "Team Development", completed: false },
        { id: 10, title: "Communication Management", completed: false },
      ],
      unlocked: false,
    },
    {
      id: 4,
      title: "Monitoring & Controlling",
      description: "Track and control project performance",
      progress: 0,
      quizzes: [
        { id: 11, title: "Change Control", completed: false },
        { id: 12, title: "Performance Monitoring", completed: false },
      ],
      unlocked: false,
    },
    {
      id: 5,
      title: "Closing",
      description: "Properly close projects and capture lessons learned",
      progress: 0,
      quizzes: [
        { id: 13, title: "Administrative Closure", completed: false },
        { id: 14, title: "Lessons Learned", completed: false },
      ],
      unlocked: false,
    },
  ];

  const [selectedPath, setSelectedPath] = useState(learningPaths[1]); // Planning phase

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-accent-teal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Learning Paths</h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl">
            Follow structured learning paths to master PMP concepts
            systematically
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Paths List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              Your Journey
            </h2>
            <div className="space-y-3">
              {learningPaths.map((path, idx) => (
                <button
                  key={path.id}
                  onClick={() => path.unlocked && setSelectedPath(path)}
                  disabled={!path.unlocked}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all",
                    selectedPath?.id === path.id
                      ? "border-primary-600 bg-primary-50"
                      : path.unlocked
                      ? "border-border-light bg-white hover:border-primary-300"
                      : "border-border-light bg-bg-tertiary opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full font-bold",
                        path.progress === 100
                          ? "bg-success text-white"
                          : path.unlocked
                          ? "bg-primary-100 text-primary-700"
                          : "bg-bg-secondary text-text-muted"
                      )}
                    >
                      {path.progress === 100 ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : path.unlocked ? (
                        idx + 1
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <h3
                      className={cn(
                        "font-semibold",
                        path.unlocked ? "text-text-primary" : "text-text-muted"
                      )}
                    >
                      {path.title}
                    </h3>
                  </div>
                  {path.unlocked && (
                    <div className="ml-11">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 transition-all"
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-text-muted">
                          {path.progress}%
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Path Detail */}
          <div className="lg:col-span-2">
            {selectedPath ? (
              <div className="bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden">
                {/* Path Header */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-8 border-b border-border-light">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-text-primary mb-2">
                        {selectedPath.title}
                      </h2>
                      <p className="text-text-secondary mb-4">
                        {selectedPath.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-text-muted">
                          {selectedPath.quizzes.length} quizzes
                        </span>
                        <span className="text-text-muted">•</span>
                        <span className="text-primary-600 font-semibold">
                          {
                            selectedPath.quizzes.filter((q) => q.completed)
                              .length
                          }{" "}
                          completed
                        </span>
                      </div>
                    </div>
                    <ProgressRing
                      progress={selectedPath.progress}
                      size={100}
                      label="Complete"
                    />
                  </div>
                </div>

                {/* Quizzes List */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-text-primary mb-4">
                    Course Content
                  </h3>
                  <div className="space-y-3">
                    {selectedPath.quizzes.map((quiz, idx) => (
                      <div
                        key={quiz.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                          quiz.completed
                            ? "border-success/30 bg-green-50"
                            : "border-border-light bg-white hover:border-primary-300"
                        )}
                      >
                        {/* Status Icon */}
                        <div
                          className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0",
                            quiz.completed
                              ? "bg-success text-white"
                              : "bg-primary-100 text-primary-700"
                          )}
                        >
                          {quiz.completed ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <span className="font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Quiz Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-primary mb-1">
                            {quiz.title}
                          </h4>
                          {quiz.completed && quiz.score && (
                            <p className="text-sm text-success font-medium">
                              Scored {quiz.score}%
                            </p>
                          )}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => navigate(`/exams/${quiz.id}`)}
                          className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all",
                            quiz.completed
                              ? "bg-white border-2 border-success text-success hover:bg-green-50"
                              : "bg-primary-600 text-white hover:bg-primary-700"
                          )}
                        >
                          {quiz.completed ? (
                            <>
                              <Play className="w-4 h-4" />
                              Retake
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-4 h-4" />
                              Start
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-white rounded-2xl border border-border-light">
                <p className="text-text-tertiary">
                  Select a learning path to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;
