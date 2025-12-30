/**
 * Quiz Mode Selection Modal
 * Allows students to choose between Practice and Exam mode before starting a quiz
 */

import { Modal } from "@/components/ui";
import { BookOpen, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export const QuizModeModal = ({ isOpen, onClose, onSelectMode, quiz }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const handleConfirm = () => {
    if (selectedMode) {
      onSelectMode(selectedMode);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Quiz Mode" size="lg">
      <div className="space-y-6">
        <p className="text-gray-600">
          Choose how you want to take this quiz. You can change this for each
          attempt.
        </p>

        {/* Practice Mode Option */}
        <button
          onClick={() => setSelectedMode("practice")}
          className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
            selectedMode === "practice"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                selectedMode === "practice"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Practice Mode
                </h3>
                {selectedMode === "practice" && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Learn at your own pace with unlimited time and pauses
              </p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  No time limit
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Unlimited pauses
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Review answers anytime
                </li>
              </ul>
            </div>
          </div>
        </button>

        {/* Exam Mode Option */}
        <button
          onClick={() => setSelectedMode("exam")}
          className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
            selectedMode === "exam"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                selectedMode === "exam"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Exam Mode
                </h3>
                {selectedMode === "exam" && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Simulate real exam conditions with time limits and structured
                pauses
              </p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  {quiz?.time_limit_minutes
                    ? `Time limit: ${quiz.time_limit_minutes} minutes`
                    : "No time limit configured"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Structured pauses (if configured)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Auto-submit when time expires
                </li>
              </ul>
              {quiz?.time_limit_minutes && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                      This quiz has a {quiz.time_limit_minutes}-minute time
                      limit in exam mode.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedMode}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </Modal>
  );
};
