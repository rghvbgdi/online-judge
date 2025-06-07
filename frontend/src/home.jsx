import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { fetchAllProblems } from "./apis/auth";
const Home = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetchAllProblems();
        console.log("Fetched problems:", response.data);
        setProblems(response.data);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading problems...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">All Problems</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border border-gray-300 text-left">#</th>
            <th className="p-3 border border-gray-300 text-left">Title</th>
            <th className="p-3 border border-gray-300 text-left">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map(({ problemNumber, title, difficulty }) => (
            <tr key={problemNumber} className="hover:bg-gray-50">
              <td className="p-3 border border-gray-300">{problemNumber}</td>
              <td className="p-3 border border-gray-300">
                <Link to={`/home/${problemNumber}`} className="text-blue-600 hover:underline">
                  {title}
                </Link>
              </td>
              <td
                className={`p-3 border border-gray-300 font-semibold ${
                  difficulty === "Easy"
                    ? "text-green-600"
                    : difficulty === "Medium"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {difficulty}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;