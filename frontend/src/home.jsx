import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllProblems, fetchSolvedProblems } from "./apis/auth"; // Use the new lightweight fetcher

// Moved outside the component to prevent re-creation on every render.
const getDifficultyInfo = (d) => {
  if (d < 1200) return { label: 'Easy', color: 'text-green-600', bgColor: 'bg-green-100' };
  if (d < 1600) return { label: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
  if (d < 2000) return { label: 'Hard', color: 'text-red-600', bgColor: 'bg-red-100' };
  return { label: 'Expert', color: 'text-purple-600', bgColor: 'bg-purple-100' };
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Helper to get the next LeetCode contest dates
const getNextLeetcodeContests = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Find next Sunday 8pm
  let daysUntilSunday = (7 - day) % 7;
  if (daysUntilSunday === 0 && (hour > 20 || (hour === 20 && minute > 0))) {
    daysUntilSunday = 7;
  }
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(20, 0, 0, 0);

  // Find next Saturday 8pm (only if this is an "alternate" week)
  // We'll use the week number to determine if it's an alternate week
  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + yearStart.getUTCDay()+1)/7);
    return weekNo;
  };
  const weekNum = getWeekNumber(now);
  let nextSaturday = null;
  if (weekNum % 2 === 1) { // Odd weeks: show next Saturday
    let daysUntilSaturday = (6 - day + 7) % 7;
    if (daysUntilSaturday === 0 && (hour > 20 || (hour === 20 && minute > 0))) {
      daysUntilSaturday = 7;
    }
    nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(20, 0, 0, 0);
  }
  return [
    { label: "Weekly Contest", date: nextSunday },
    ...(nextSaturday ? [{ label: "Biweekly Contest", date: nextSaturday }] : [])
  ];
};

const Home = () => {
  const [allProblems, setAllProblems] = useState([]); // Store the original, unfiltered list
  const [loading, setLoading] = useState(true);
  const [solvedProblems, setSolvedProblems] = useState(new Set()); // Use a Set for efficient lookups
  const [problemOfTheDay, setProblemOfTheDay] = useState(null); // For the "Problem of the Day" feature
  const [sortOrder, setSortOrder] = useState('none'); // 'asc', 'desc', 'none'
  const [selectedTag, setSelectedTag] = useState('all'); // 'all' or a specific tag
  const [searchTerm, setSearchTerm] = useState(''); // For the search input
  const [leetcodeContests, setLeetcodeContests] = useState([]); // New state for LeetCode contests
  const [codeforcesContests, setCodeforcesContests] = useState([]); // New state for Codeforces contests
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Memoize the list of available tags to prevent re-computation on every render
  const availableTags = useMemo(() => {
    const tags = new Set();
    allProblems.forEach(p => p.tags.forEach(tag => tags.add(tag)));
    return ['all', ...Array.from(tags).sort()];
  }, [allProblems]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all problems
        const problemsResponse = await fetchAllProblems();
        const problemsData = problemsResponse.data;
        setAllProblems(problemsData);
        if (problemsData.length > 0) {
          // Select a random problem as the "Problem of the Day"
          setProblemOfTheDay(problemsData[Math.floor(Math.random() * problemsData.length)]);
        }

        // Try to fetch user's solved problems. This will fail if not logged in, which is fine.
        try {
          // Use the new, more efficient endpoint
          const solvedResponse = await fetchSolvedProblems();
          setSolvedProblems(new Set(solvedResponse.data)); // The response is now just an array of numbers
        } catch (userError) {
          // User is likely not logged in, so solvedProblems will remain an empty set.
          console.log("Could not fetch user stats, assuming user is not logged in.");
        }
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Fetch LeetCode upcoming contests using GraphQL
    const fetchLeetcodeContests = async () => {
      try {
        const query = `
          query {
            upcomingContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `;
        const response = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
        const json = await response.json();
        const upcoming = json.data.upcomingContests
          .sort((a, b) => a.startTime - b.startTime)
          .slice(0, 2);
        setLeetcodeContests(upcoming);
      } catch (error) {
        console.error("Failed to fetch LeetCode contests:", error);
      }
    };

    // Fetch Codeforces upcoming contests
    const fetchCodeforcesContests = async () => {
      try {
        const response = await fetch('https://codeforces.com/api/contest.list');
        const json = await response.json();
        if (json.status === "OK" && json.result) {
          const upcoming = json.result
            .filter(c => c.phase === 'BEFORE')
            .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
            .slice(0, 2);
          setCodeforcesContests(upcoming);
        }
      } catch (error) {
        console.error("Failed to fetch Codeforces contests:", error);
      }
    };

    fetchLeetcodeContests();
    fetchCodeforcesContests();
  }, []);

  // Memoize the filtered and sorted problems to avoid re-calculating on every render
  const displayedProblems = useMemo(() => {
    let problems = [...allProblems];

    // Apply search term filter
    if (searchTerm) {
      problems = problems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Apply tag filter
    if (selectedTag !== 'all') {
      problems = problems.filter(p => p.tags.includes(selectedTag));
    }

    // Apply difficulty sort
    if (sortOrder !== 'none') {
      problems.sort((a, b) => {
        return sortOrder === 'asc' ? a.difficulty - b.difficulty : b.difficulty - a.difficulty;
      });
    }

    return problems;
  }, [allProblems, sortOrder, selectedTag, searchTerm]);

  const handleSortChange = () => {
    // Cycle through sort states: none -> asc -> desc -> none
    setSortOrder(prev => {
      if (prev === 'none') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };

  if (loading) return <p className="p-6 text-center">Loading problems...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-10 text-center text-slate-700">All Problems</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content: Filters and Problem List */}
          <div className="lg:col-span-3 space-y-8">
            {/* Filter and Sort Controls */}
            <div className="grid grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-lg">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-indigo-500"
              />
              <select
                id="tag-filter"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:border-indigo-500"
              >
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag === 'all' ? 'Filter by Tag' : tag}</option>
                ))}
              </select>
              <button
                onClick={handleSortChange}
                className="w-full px-5 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              >
                Sort by Difficulty ({sortOrder === 'asc' ? '▲ Asc' : sortOrder === 'desc' ? '▼ Desc' : 'Default'})
              </button>
            </div>

            {/* Problem Table */}
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-slate-200 text-slate-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-4 text-left w-12">Status</th>
                    <th className="py-3 px-6 text-left">Title</th>
                    <th className="py-3 px-6 text-left">Difficulty</th>
                    <th className="py-3 px-6 text-left">Tags</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 text-sm font-light">
                  {displayedProblems.map(({ problemNumber, title, difficulty, tags }) => {
                    const difficultyInfo = getDifficultyInfo(difficulty);
                    const isSolved = solvedProblems.has(problemNumber);

                    return (
                      <tr key={problemNumber} className={`border-b border-slate-200 hover:bg-sky-50 transition-colors duration-200 group ${isSolved ? 'bg-green-50/50' : ''}`}>
                        <td className="py-4 px-4 text-center">
                          {isSolved && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <Link to={`/home/${problemNumber}`} className="text-blue-600 group-hover:text-blue-700 hover:underline font-medium">
                            {title}
                          </Link>
                        </td>
                        <td className={`py-4 px-6 font-semibold ${difficultyInfo.color}`}>
                          {difficulty}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {tags?.map((tag, index) => (
                              <span
                                key={`${problemNumber}-${tag}-${index}`}
                                className="px-2.5 py-1 text-xs bg-sky-100 text-sky-700 rounded-full font-medium group-hover:bg-sky-200 transition-colors duration-150"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar: Problem of the Day and Actions */}
          <div className="lg:col-span-1 space-y-8">
            {/* Problem of the Day Section */}
            {problemOfTheDay && (
              <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-yellow-400">
                <h2 className="text-xl font-bold text-slate-800 mb-2">🔥 Problem of the Day</h2>
                <p className="text-slate-600 mb-4 leading-relaxed">A daily challenge to keep you sharp!</p>
                <div className="flex justify-between items-center">
                  <Link to={`/home/${problemOfTheDay.problemNumber}`} className="font-semibold text-blue-600 hover:underline">
                    {problemOfTheDay.title}
                  </Link>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getDifficultyInfo(problemOfTheDay.difficulty).bgColor} ${getDifficultyInfo(problemOfTheDay.difficulty).color}`}>
                    {problemOfTheDay.difficulty}
                  </span>
                </div>
              </div>
            )}

            {/* Upcoming Contests Card */}
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Contests</h3>
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                    <img src="https://leetcode.com/favicon.ico" alt="LeetCode" className="w-4 h-4" />
                    LeetCode
                  </h4>
                  <ul className="space-y-2">
                    {leetcodeContests.map((contest, idx) => (
                      <li key={idx}>
                        <span className="text-blue-600 font-medium">{contest.label}</span>
                        <div className="text-xs text-slate-500">
                          {contest.date.toLocaleString()} (8:00 PM IST)
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                    <img src="https://sta.codeforces.com/s/12345/favicon.ico" alt="Codeforces" className="w-4 h-4" />
                    Codeforces
                  </h4>
                  <ul className="space-y-2">
                    {codeforcesContests.length === 0 && <li>No upcoming contests</li>}
                    {codeforcesContests.map((contest) => (
                      <li key={contest.id}>
                        <a href={`https://codeforces.com/contest/${contest.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {contest.name}
                        </a>
                        <div className="text-xs text-slate-500">
                          {new Date(contest.startTimeSeconds * 1000).toLocaleString()} ({formatDuration(contest.durationSeconds || 0)})
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;