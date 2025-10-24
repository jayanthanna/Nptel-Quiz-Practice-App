import React, { useState, useEffect } from "react";

export default function QuestionCard({
  questionData,
  onAnswer,
  currentIndex,
  selectedOption,
}) {
  const correctOptions = questionData?.correctOptions || [];
  const isMulti = correctOptions.length > 1;

  // local selected: string for single, array for multi
  const [selected, setSelected] = useState(isMulti ? [] : null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    // initialize from parent persisted selection
    if (isMulti) {
      setSelected(Array.isArray(selectedOption) ? selectedOption : []);
      setIsAnswered(Array.isArray(selectedOption) && selectedOption.length > 0);
    } else {
      setSelected(selectedOption ?? null);
      setIsAnswered(selectedOption != null);
    }
  }, [questionData, selectedOption]);

  const toggleMulti = (option) => {
    setSelected((prev) => {
      const copy = Array.isArray(prev) ? [...prev] : [];
      const idx = copy.indexOf(option);
      if (idx >= 0) copy.splice(idx, 1);
      else copy.push(option);
      return copy;
    });
  };

  const handleClick = (option) => {
    if (isAnswered && !isMulti) return; // single-choice locked
    if (isMulti) {
      // allow toggling until user clicks Submit
      toggleMulti(option);
      return;
    }
    // single-choice immediate submit
    setSelected(option);
    setIsAnswered(true);
    onAnswer(
      option,
      option === questionData.answer || correctOptions.includes(option)
    );
  };

  const submitMulti = () => {
    if (isAnswered) return;
    const chosen = Array.isArray(selected) ? selected : [];
    // correct if sets equal (no partial credit)
    const normalize = (arr) =>
      [...new Set(arr.map((s) => String(s).trim()))].sort().join("||");
    const isCorrect = normalize(chosen) === normalize(correctOptions);
    setIsAnswered(true);
    onAnswer(chosen, isCorrect);
  };

  // show visible selection before submit and preserve correct/wrong after submit
  const getOptionClass = (option) => {
    if (!isAnswered) {
      // visual for pre-submit selection
      if (isMulti) {
        return selected.includes(option)
          ? "bg-blue-100 border-2 border-blue-300 text-left"
          : "bg-gray-100 hover:bg-gray-200";
      } else {
        return selected === option
          ? "bg-blue-100 border-2 border-blue-300 text-left"
          : "bg-gray-100 hover:bg-gray-200";
      }
    }
    // answered state: show correct in green, selected wrong in red
    if (correctOptions.includes(option)) return "bg-green-500 text-white";
    if (isMulti ? selected.includes(option) : option === selected)
      return "bg-red-500 text-white";
    return "bg-gray-100";
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {questionData.question}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {questionData.options.map((option) => (
          <button
            key={option}
            onClick={() => handleClick(option)}
            className={`p-4 rounded text-lg ${getOptionClass(option)}`}
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="text-left">{option}</span>

              {/* pre-submit selection marker */}
              {!isAnswered &&
                (isMulti ? selected.includes(option) : selected === option) && (
                  <span className="text-blue-600">●</span>
                )}

              {/* post-answer markers */}
              {isAnswered && correctOptions.includes(option) && <span>✔️</span>}
              {isAnswered &&
                (isMulti ? selected.includes(option) : option === selected) &&
                !correctOptions.includes(option) && <span>❌</span>}
            </div>
          </button>
        ))}
      </div>

      {isMulti && !isAnswered && (
        <div className="mt-4 text-center">
          <button
            onClick={submitMulti}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            type="button"
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}
