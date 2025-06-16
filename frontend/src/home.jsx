import React, { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-10 text-center text-slate-700">All Problems</h1>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <table className="w-full table-auto">
          <thead>
            <tr className="bg-slate-200 text-slate-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Title</th>
              <th className="py-3 px-6 text-left">Difficulty</th>
              <th className="py-3 px-6 text-left">Tags</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 text-sm font-light">
            {problems.map(({ problemNumber, title, difficulty, tags }) => (
              <tr key={problemNumber} className="border-b border-slate-200 hover:bg-sky-100 hover:shadow-md hover:scale-[1.005] transform transition-all duration-200 ease-in-out group">
                <td className="py-4 px-6">
                  <Link to={`/home/${problemNumber}`} className="text-blue-600 group-hover:text-blue-700 hover:underline font-medium">
                    {title}
                  </Link>
                </td>
                <td
                  className={`py-4 px-6 font-semibold ${
                    difficulty === "Easy"
                      ? "text-green-600"
                      : difficulty === "Medium" 
                      ? "text-yellow-500" // Adjusted yellow for better contrast on hover
                      : "text-red-600"
                  }`}
                >
                  {difficulty}
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs bg-sky-100 text-sky-700 rounded-full font-medium group-hover:bg-sky-200 transition-colors duration-150"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default Home;