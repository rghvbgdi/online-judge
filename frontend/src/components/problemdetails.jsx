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

  return (
    <div className="flex h-screen gap-4">
      <div className="w-6/12 p-6 overflow-y-auto border-r border-gray-300">
        {/* Title Section */}
        <div className="border-b pb-4">
          <h1 className="text-4xl font-bold text-blue-700">{problem.title}</h1>
        </div>

        {/* Description Section */}
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-2">Problem Description</h2>
          <p className="text-gray-800 leading-relaxed">{problem.description}</p>
        </div>

        {/* Difficulty Section */}
        <div className="bg-gray-50 border-l-4 border-blue-600 p-4 rounded">
          <p className="text-sm font-semibold text-gray-700">
            Difficulty:{" "}
            <span
              className={`${
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
      <div className="w-5/12 p-6 overflow-y-auto">
        <Compiler initialCode={`// Start coding for ${problem.title}`} problemId={problemNumber} />
      </div>
    </div>
  );
};

export default ProblemDetails;