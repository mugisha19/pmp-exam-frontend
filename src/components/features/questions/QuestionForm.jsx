/**
 * Question Form Components
 * Reusable form components for creating and editing questions
 */

import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Question Type Selector Component
 * Renders a visual selector for different question types
 */
export const QuestionTypeSelector = ({ value, onChange, options }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all
            ${
              value === option.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Question Options Builder Component
 * Dynamic form builder for question options based on question type
 */
export const QuestionOptionsBuilder = ({
  questionType,
  options = [],
  onChange,
}) => {
  const handleAddOption = () => {
    onChange([...options, { text: "", is_correct: false }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      onChange(newOptions);
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange(newOptions);
  };

  const handleCorrectToggle = (index) => {
    const newOptions = [...options];

    // For multiple choice and true/false, only one option can be correct
    if (questionType === "multiple_choice" || questionType === "true_false") {
      newOptions.forEach((opt, i) => {
        opt.is_correct = i === index;
      });
    } else {
      // For multiple response, multiple options can be correct
      newOptions[index].is_correct = !newOptions[index].is_correct;
    }

    onChange(newOptions);
  };

  // Render for True/False questions
  if (questionType === "true_false") {
    const trueOption = options[0] || { text: "True", is_correct: false };
    const falseOption = options[1] || { text: "False", is_correct: false };

    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleCorrectToggle(0)}
          className={`
            w-full px-4 py-3 rounded-lg border-2 text-left font-medium transition-all
            ${
              trueOption.is_correct
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span>True</span>
            {trueOption.is_correct && (
              <Check className="w-5 h-5 text-green-600" />
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleCorrectToggle(1)}
          className={`
            w-full px-4 py-3 rounded-lg border-2 text-left font-medium transition-all
            ${
              falseOption.is_correct
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span>False</span>
            {falseOption.is_correct && (
              <Check className="w-5 h-5 text-green-600" />
            )}
          </div>
        </button>
      </div>
    );
  }

  // Render for Multiple Choice and Multiple Response questions
  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div key={index} className="flex items-start gap-3">
          {/* Correct Answer Checkbox/Radio */}
          <button
            type="button"
            onClick={() => handleCorrectToggle(index)}
            className={`
              mt-2 shrink-0 w-6 h-6 rounded border-2 transition-all
              ${
                option.is_correct
                  ? "bg-green-500 border-green-500"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }
            `}
            title={option.is_correct ? "Correct answer" : "Mark as correct"}
          >
            {option.is_correct && <Check className="w-5 h-5 text-white" />}
          </button>

          {/* Option Text Input */}
          <div className="flex-1">
            <Input
              value={option.text}
              onChange={(e) =>
                handleOptionChange(index, "text", e.target.value)
              }
              placeholder={`Option ${index + 1}`}
              className={option.is_correct ? "border-green-300" : ""}
            />
          </div>

          {/* Remove Button */}
          {options.length > 2 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveOption(index)}
              className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}

      {/* Add Option Button */}
      {questionType !== "true_false" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full"
        >
          Add Option
        </Button>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        {questionType === "multiple_choice"
          ? "Click the checkbox to mark the correct answer (only one can be selected)"
          : "Click the checkboxes to mark all correct answers (multiple can be selected)"}
      </p>
    </div>
  );
};

/**
 * Matching Question Builder Component
 * Special builder for matching-type questions
 */
export const MatchingQuestionBuilder = ({ pairs = [], onChange }) => {
  const handleAddPair = () => {
    onChange([...pairs, { prompt: "", match: "" }]);
  };

  const handleRemovePair = (index) => {
    if (pairs.length > 2) {
      const newPairs = pairs.filter((_, i) => i !== index);
      onChange(newPairs);
    }
  };

  const handlePairChange = (index, field, value) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    onChange(newPairs);
  };

  return (
    <div className="space-y-4">
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-1 grid grid-cols-2 gap-3">
            <Input
              value={pair.prompt}
              onChange={(e) =>
                handlePairChange(index, "prompt", e.target.value)
              }
              placeholder={`Prompt ${index + 1}`}
            />
            <Input
              value={pair.match}
              onChange={(e) => handlePairChange(index, "match", e.target.value)}
              placeholder={`Match ${index + 1}`}
            />
          </div>

          {pairs.length > 2 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemovePair(index)}
              className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddPair}
        leftIcon={<Plus className="w-4 h-4" />}
        className="w-full"
      >
        Add Pair
      </Button>
    </div>
  );
};
