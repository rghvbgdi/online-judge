import NotFound from "../notFound.jsx";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProblemByNumber } from '../apis/auth.jsx';
import Compiler from './compiler.jsx';

const ProblemDetails = () => {
  const { problemNumber } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { 
    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchProblemByNumber(problemNumber);
        setProblem(response.data);
        setLoading(false);
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 400)) {
          setProblem(null);
          setError("notfound");
          setLoading(false);
        } else {
          setError("other");
          setLoading(false);
        }
      }
    };

    fetchProblem();
  }, [problemNumber]);

  if (loading) return <p>Loading problem...</p>;
  if (error === "notfound") return <NotFound />;
  if (error === "other") return <p className="text-red-600">Something went wrong. Please try again.</p>;

  // Ensure problem object exists before trying to access its properties
  if (!problem) return <p className="p-6 text-center">Problem data is not available.</p>;

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 md:gap-6 p-4 md:p-6 bg-gray-50">
      {/* Left Column: Problem Details */}
      <div className="w-full md:w-7/12 lg:w-3/5 bg-white shadow-xl rounded-lg p-6 overflow-y-auto">
        {/* Title Section */}
        <div className="border-b border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">{problem.title}</h1>
          {/* Tags Section moved here */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Problem Description</h2>
          <div
            className="whitespace-pre-wrap font-mono text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md overflow-x-auto [tab-size:4]"
          >
            {problem.description || "No description available."}
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Input</h2>
          
          <div
            className="whitespace-pre font-mono text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md overflow-x-auto [tab-size:4]"
          >
            {problem.input || "No input format specified."}
          </div>
        </div>

        {/* Output Section */}
        <div className="mb-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Output</h2>
          
          <div
            className="whitespace-pre font-mono text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md overflow-x-auto [tab-size:4]"
          >
            {problem.output || "No output format specified."}
          </div>
        </div>

        {/* Difficulty Section */}
        <div className={`bg-gray-100 border-l-4 p-4 rounded ${
            problem.difficulty === "Easy" ? "border-green-500" :
            problem.difficulty === "Medium" ? "border-yellow-500" :
            "border-red-500"
          }`}>
          <p className="text-sm font-semibold text-gray-800">
            Difficulty:{" "}
            <span
              className={`font-bold ${
                problem.difficulty === "Easy"
                  ? "text-green-600"
                  : problem.difficulty === "Medium"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {problem.difficulty}
            </span>
          </p>
        </div>

      </div>
      {/* Right Column: Compiler */}
      <div className="w-full md:w-5/12 lg:w-2/5 bg-white shadow-xl rounded-lg p-6 overflow-y-auto flex flex-col">
        <Compiler initialCode={`// Start coding for ${problem.title}\n\n`} problemId={problemNumber} />
      </div>
    </div>
  );
};

export default ProblemDetails;