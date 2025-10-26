import React from "react";

export default function Result({
  score,
  total,
  userName,
  assignmentName,
  subjectName,
  onContinue,
  onChooseAnother,
}) {
  const isRandomMode = assignmentName?.includes("Random");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          {isRandomMode ? "Random Quiz Completed!" : "Assignment Completed!"}
        </h2>
        <p className="text-lg mb-1">Congratulations, {userName}!</p>
        <p className="text-sm text-gray-600 mb-4">
          Subject: {subjectName} • {assignmentName}
        </p>
        <p className="text-lg">
          Your score: {score} out of {total}
        </p>
        <p className="text-lg mt-2">
          Percentage: {Math.round((score / total) * 100)}%
        </p>
        <div className="mt-6 flex justify-center gap-4">
          {!isRandomMode && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={onContinue}
            >
              Continue to next assignment
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onChooseAnother}
          >
            {isRandomMode ? "Try Another Quiz" : "Choose another week"}
          </button>
        </div>
      </div>
    </div>
  );
}
