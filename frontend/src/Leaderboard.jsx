import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from './apis/auth';
import { Link } from 'react-router-dom';

// A simple skeleton loader component for the table rows
const SkeletonRow = () => (
  <tr className="border-b border-slate-200">
    <td className="py-4 px-6 text-center">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-8 mx-auto"></div>
    </td>
    <td className="py-4 px-6 text-left">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-32"></div>
    </td>
    <td className="py-4 px-6 text-center">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-12 mx-auto"></div>
    </td>
    <td className="py-4 px-6 text-center">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-16 mx-auto"></div>
    </td>
  </tr>
);

const getRankClass = (rank) => {
  if (rank === 1) return 'bg-yellow-100 text-yellow-800';
  if (rank === 2) return 'bg-slate-200 text-slate-800';
  if (rank === 3) return 'bg-orange-200 text-orange-800';
  return '';
};

const avatarColors = [
  'bg-red-200 text-red-800',
  'bg-blue-200 text-blue-800',
  'bg-green-200 text-green-800',
  'bg-purple-200 text-purple-800',
  'bg-yellow-200 text-yellow-800',
  'bg-indigo-200 text-indigo-800',
  'bg-pink-200 text-pink-800',
];

const getAvatarInfo = (name) => {
  if (!name) return { initials: '?', color: 'bg-gray-200 text-gray-800' };
  
  const parts = name.split(' ').filter(Boolean);
  const initials = parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : name.substring(0, 2);

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = avatarColors[Math.abs(hash % avatarColors.length)];

  return { initials: initials.toUpperCase(), color };
};

const RankDisplay = ({ rank }) => {
  if (rank === 1) return <span title="1st Place" className="text-2xl">🥇</span>;
  if (rank === 2) return <span title="2nd Place" className="text-2xl">🥈</span>;
  if (rank === 3) return <span title="3rd Place" className="text-2xl">🥉</span>;
  return <span className="font-bold text-lg text-slate-500">{rank}</span>;
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLeaderboardData = async () => {
      try {
        setLoading(true);
        // This API should return an array of users sorted by score.
        // Example user object: { username: 'user1', problemsSolved: 10, score: 1500 }
        const response = await fetchLeaderboard();
        setLeaderboard(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError("Could not load the leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getLeaderboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-10 text-center text-slate-700">Leaderboard</h1>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-slate-200 text-slate-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-center w-20">Rank</th>
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-center">Problems Solved</th>
                <th className="py-3 px-6 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 text-sm font-light">
              {loading ? (
                [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-red-500">{error}</td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-500">The leaderboard is empty.</td>
                </tr>
              ) : (
                leaderboard.map((user, index) => {
                  const rank = index + 1;
                  const avatar = getAvatarInfo(user.username);
                  return (
                    <tr key={user.userId} className={`border-b border-slate-200 hover:bg-sky-50 transition-colors duration-200 ${getRankClass(rank)}`}>
                      <td className="py-4 px-6 text-center">
                        <RankDisplay rank={rank} />
                      </td>
                      <td className="py-4 px-6 text-left font-medium">
                        <Link to={`/profile/${user.userId}`} className="flex items-center gap-3 group">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${avatar.color}`}>{avatar.initials}</div>
                          <span className="text-slate-800 group-hover:text-blue-600 group-hover:underline transition-colors">{user.username}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-center text-slate-600 font-medium">{user.problemsSolved}</td>
                      <td className="py-4 px-6 text-center font-bold text-blue-600 text-lg">{user.score}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;