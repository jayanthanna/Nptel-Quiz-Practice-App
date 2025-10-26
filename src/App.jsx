import React, { useState } from "react";
import QuestionCard from "./components/QuestionCard";
import Result from "./components/Result";
import subject1 from "./data/subject1.json";
import subject2 from "./data/subject2.json";
import subject3 from "./data/subject3.json";

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [gameStarted, setGameStarted] = useState(false);

  // new state for assignment selection
  const [assignmentsMap, setAssignmentsMap] = useState({}); // { "Week 1": [q,...], ... }
  const [assignmentList, setAssignmentList] = useState([]); // ordered keys
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentSelect, setShowAssignmentSelect] = useState(false);
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(-1);

  // persistent per-question answers
  const [userAnswers, setUserAnswers] = useState([]); // selected option per question or null
  const [userCorrect, setUserCorrect] = useState([]); // boolean per question or null

  // Add new state for random mode
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [randomCount, setRandomCount] = useState(0);

  // utility: convert imported subject data to assignments map
  const buildAssignments = (data) => {
    // if data is an object with keys (assignments already grouped)
    if (!Array.isArray(data) && typeof data === "object") {
      return { map: data, list: Object.keys(data) };
    }
    // if data is a flat array, chunk into 10-per-assignment
    const chunkSize = 10;
    const map = {};
    const list = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      const idx = Math.floor(i / chunkSize) + 1;
      const key = `Week ${idx}`;
      map[key] = data.slice(i, i + chunkSize);
      list.push(key);
    }
    return { map, list };
  };

  const getSubjectData = (subject) => {
    switch (subject) {
      case "PMM":
        return subject1;
      case "PBM":
        return subject2;
      case "FVR":
        return subject3;
      default:
        return [];
    }
  };

  const handleSubjectSelect = (subject) => {
    const data = getSubjectData(subject);
    const { map, list } = buildAssignments(data);

    // Flatten all questions for random mode
    const allQuestions = Object.values(map).flat();

    setAssignmentsMap(map);
    setAssignmentList([...list, "Random 30 Questions", "Random 50 Questions"]);
    setSelectedSubject(subject);
    setShowAssignmentSelect(true);
    setGameStarted(false);
    setSelectedAssignment(null);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setCurrentAssignmentIndex(-1);
    setUserAnswers([]);
    setUserCorrect([]);
    setIsRandomMode(false);
    setRandomCount(0);
  };

  // Add helper to get random questions
  const getRandomQuestions = (allQuestions, count) => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Modify handleAssignmentSelect
  const handleAssignmentSelect = (key, idx) => {
    // Handle random modes
    if (key === "Random 30 Questions" || key === "Random 50 Questions") {
      const count = key === "Random 30 Questions" ? 30 : 50;
      const allQuestions = Object.values(assignmentsMap).flat();
      const randomQs = getRandomQuestions(allQuestions, count);

      // Process random questions
      const processed = randomQs.map((q) => ({
        ...q,
        correctOptions: parseCorrectOptions(q.answer, q.options || []),
      }));

      setQuestions(processed);
      setSelectedAssignment(key);
      setCurrentAssignmentIndex(-1); // Special index for random mode
      setCurrentIndex(0);
      setScore(0);
      setGameStarted(true);
      setShowAssignmentSelect(false);
      setIsRandomMode(true);
      setRandomCount(count);
      setUserAnswers(Array(processed.length).fill(null));
      setUserCorrect(Array(processed.length).fill(null));
      return;
    }

    // Regular week assignment handling
    const qs = assignmentsMap[key] || [];
    const processed = qs.map((q) => ({
      ...q,
      correctOptions: parseCorrectOptions(q.answer, q.options || []),
    }));

    setQuestions(processed);
    setSelectedAssignment(key);
    setCurrentAssignmentIndex(idx);
    setCurrentIndex(0);
    setScore(0);
    setGameStarted(true);
    setShowAssignmentSelect(false);
    setIsRandomMode(false);
    setRandomCount(0);
    setUserAnswers(Array(processed.length).fill(null));
    setUserCorrect(Array(processed.length).fill(null));
  };

  // add helper to parse letter answers into option text

  const parseCorrectOptions = (answer, options) => {
    if (!answer) return [];
    // if already an array or answer matches exactly an option, return normalized array
    if (Array.isArray(answer)) return answer;
    const trimmed = String(answer).trim();
    // if answer matches one of option texts, return it
    const exact = options.find((o) => o.trim() === trimmed);
    if (exact) return [exact];

    // detect patterns like "A & C", "A, C", "A and C", "A&C"
    const letters = trimmed
      .replace(/and/gi, "&")
      .split(/[,&]/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (letters.length === 0) {
      // fallback: treat the whole string as an option text
      return [trimmed];
    }

    // map A->options[0], B->options[1], etc.
    const mapLetterToIndex = (L) => {
      const code = L.charCodeAt(0);
      if (code >= 65 && code <= 90) return code - 65;
      return null;
    };

    const result = [];
    letters.forEach((L) => {
      const idx = mapLetterToIndex(L);
      if (idx != null && idx < options.length) result.push(options[idx]);
    });

    // if parsed nothing, fallback to original string
    return result.length ? result : [trimmed];
  };

  // when loading assignment questions, attach correctOptions on each question
  // locate where you set questions (e.g. in handleAssignmentSelect) and replace with processed array
  // ...existing code...
  // const handleAssignmentSelect = (key, idx) => {
  //   const qs = assignmentsMap[key] || [];
  //   // process each question to add correctOptions array
  //   const processed = qs.map((q) => ({
  //     ...q,
  //     correctOptions: parseCorrectOptions(q.answer, q.options || []),
  //   }));
  //   setQuestions([...processed]);
  //   setSelectedAssignment(key);
  //   setCurrentAssignmentIndex(idx);
  //   setCurrentIndex(0);
  //   setScore(0);
  //   setGameStarted(true);
  //   setShowAssignmentSelect(false);
  //   // initialize per-question answer arrays
  //   setUserAnswers(Array(processed.length).fill(null));
  //   setUserCorrect(Array(processed.length).fill(null));
  // };
  // ...existing code...

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    // if not last question, go next; if last, advance index to trigger result view
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // move beyond last question to show result
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // update answer for current question
  const handleAnswerUpdate = (option, isCorrect) => {
    setUserAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = option;
      return copy;
    });
    setUserCorrect((prev) => {
      const copy = [...prev];
      copy[currentIndex] = !!isCorrect;
      // recalc score
      const newScore = copy.filter(Boolean).length;
      setScore(newScore);
      return copy;
    });
  };

  // called by Result to continue to next assignment
  const handleContinueToNextAssignment = () => {
    const nextIdx = currentAssignmentIndex + 1;
    if (nextIdx < assignmentList.length) {
      const nextKey = assignmentList[nextIdx];
      handleAssignmentSelect(nextKey, nextIdx);
      return;
    }
    // no next assignment: go back to assignment chooser
    setShowAssignmentSelect(true);
    setGameStarted(false);
    setSelectedAssignment(null);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setCurrentAssignmentIndex(-1);
    setUserAnswers([]);
    setUserCorrect([]);
  };

  const handleChooseAnotherAssignment = () => {
    setShowAssignmentSelect(true);
    setGameStarted(false);
    setSelectedAssignment(null);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setCurrentAssignmentIndex(-1);
    setUserAnswers([]);
    setUserCorrect([]);
  };

  // small centered nav bar for going back / choosing week
  const TopNav = () => (
    <div className="w-full flex justify-center mb-4">
      <div className="bg-white px-4 py-2 rounded shadow flex gap-3 items-center">
        <button
          className="px-3 py-1 border rounded text-sm"
          onClick={() => {
            // go back to subject chooser
            setSelectedSubject("");
            setAssignmentsMap({});
            setAssignmentList([]);
            setShowAssignmentSelect(false);
            setGameStarted(false);
            setSelectedAssignment(null);
            setQuestions([]);
            setCurrentIndex(0);
            setScore(0);
            setUserAnswers([]);
            setUserCorrect([]);
          }}
        >
          Change Subject
        </button>
        <button
          className="px-3 py-1 border rounded text-sm"
          onClick={() => {
            // open assignment chooser
            setShowAssignmentSelect(true);
            setGameStarted(false);
          }}
        >
          Choose Week
        </button>
        <div className="text-sm text-gray-600 px-2">|</div>
        <div className="text-sm">
          {selectedSubject}{" "}
          {selectedAssignment ? `• ${selectedAssignment}` : ""}
        </div>
      </div>
    </div>
  );

  // render: subject chooser
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Quiz App</h1>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full p-2 mb-6 border rounded"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <div className="flex flex-col gap-4">
            <button
              className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
              onClick={() => handleSubjectSelect("PMM")}
            >
              PMM (Project Management for Managers)
            </button>
            <button
              className="bg-green-500 text-white p-3 rounded hover:bg-green-600"
              onClick={() => handleSubjectSelect("PBM")}
            >
              PBM (Project and Budget Management)
            </button>
            <button
              className="bg-purple-500 text-white p-3 rounded hover:bg-purple-600"
              onClick={() => handleSubjectSelect("FVR")}
            >
              FVR (Foundation and Virtual Reality)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // render: assignment chooser
  if (showAssignmentSelect) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <TopNav />
          <div className="bg-white p-8 rounded-lg shadow-lg w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {selectedSubject} - Choose Assignment
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {assignmentList.slice(0, -2).map((key, idx) => (
                <button
                  key={key}
                  className="p-3 border rounded hover:bg-gray-100 text-center"
                  onClick={() => handleAssignmentSelect(key, idx)}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {assignmentList.slice(-2).map((key) => (
                <button
                  key={key}
                  className="w-full p-3 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 text-center"
                  onClick={() => handleAssignmentSelect(key, -1)}
                >
                  {key}
                </button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  setSelectedSubject("");
                  setAssignmentsMap({});
                  setAssignmentList([]);
                  setShowAssignmentSelect(false);
                }}
              >
                Back to subjects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // render: result after finishing current assignment
  if (gameStarted && currentIndex >= questions.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-full max-w-md">
          <TopNav />
          <Result
            score={score}
            total={questions.length}
            userName={userName}
            assignmentName={selectedAssignment}
            subjectName={selectedSubject}
            onContinue={handleContinueToNextAssignment}
            onChooseAnother={handleChooseAnotherAssignment}
          />
        </div>
      </div>
    );
  }

  // render: quiz view for selected assignment
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        <TopNav />
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">Welcome, {userName}!</h2>
          <p className="text-gray-600">Subject: {selectedSubject}</p>
          <p className="text-gray-600">Assignment: {selectedAssignment}</p>
          <p className="text-gray-600">
            Question {Math.min(currentIndex + 1, questions.length)} of{" "}
            {questions.length}
          </p>
        </div>
        {questions[currentIndex] ? (
          <QuestionCard
            key={currentIndex}
            questionData={questions[currentIndex]}
            currentIndex={currentIndex}
            selectedOption={userAnswers[currentIndex]}
            onAnswer={(option, isCorrect) => {
              handleAnswerUpdate(option, isCorrect);
            }}
          />
        ) : (
          // if questions[currentIndex] is undefined and we are here it means we haven't advanced to result yet
          <div className="text-center p-8 bg-white rounded shadow">
            <p className="text-lg">No question available.</p>
          </div>
        )}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNextQuestion}
            className="px-6 py-2 bg-blue-500 text-white rounded"
          >
            {currentIndex + 1 < questions.length ? "Next" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
