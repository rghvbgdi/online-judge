import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { fetchUserStats, fetchPublicProfile } from './apis/auth';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * A skeleton loader component for the statistic cards to improve perceived performance.
 */
const StatCardSkeleton = () => (
  <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200 mb-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
  </div>
);

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null); // Simplified to a single state object
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId from URL if it exists

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);
        let statsRes;
        if (userId) {
          // If there's a userId in the URL, fetch the public profile
          statsRes = await fetchPublicProfile(userId);
        } else {
          // Otherwise, fetch the logged-in user's stats
          statsRes = await fetchUserStats();
        }

        // Store the entire stats object in a single state variable
        setUserStats(statsRes.data);

      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response && err.response.status === 404) {
            setError('User not found.');
        } else if (!userId && err.response && (err.response.status === 401 || err.response.status === 403)) {
            setError('You must be logged in to view your profile.');
            navigate('/login');
        } else {
            setError('Failed to load user profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [navigate, userId]); // Re-run when userId changes

  const getHeatmapValues = () => {
    if (!userStats || !userStats.submissionHistory) return [];
    return userStats.submissionHistory.map(submission => ({
      date: submission.date,
      count: submission.count,
    }));
  };

  if (loading) {
    // Display a skeleton layout that mimics the final page structure
    return (
      <div className="max-w-4xl mx-auto p-6 my-8">
        <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto mb-6 animate-pulse"></div>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-red-600 text-lg font-medium">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {userId ? `${userStats?.firstname || ''} ${userStats?.lastname || ''}'s Profile` : 'Your Profile'}
      </h1>

      {userStats && (
        <>
        {/* Basic User Information */}
        <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">User Information</h2>
            <p className="text-lg">Name: <span className="font-bold text-gray-700">{userStats.firstname} {userStats.lastname}</span></p>
            {/* Conditionally render email only if it's the user's own profile */}
            {userStats.email && (
              <p className="text-lg">Email: <span className="font-bold text-gray-700">{userStats.email}</span></p>
            )}
            {userStats.joinedAt && (
                <p className="text-lg">Joined: <span className="font-bold text-gray-700">{new Date(userStats.joinedAt).toLocaleDateString()}</span></p>
            )}
        </div>

        <div className="bg-red-50 p-4 rounded-md shadow-sm border border-red-200 mb-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Submission Heatmap</h2>
          <CalendarHeatmap
            startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
            endDate={new Date()}
            values={getHeatmapValues()}
            classForValue={value => {
              if (!value) return 'color-empty';
              if (value.count >= 4) return 'color-github-4';
              if (value.count >= 3) return 'color-github-3';
              if (value.count >= 2) return 'color-github-2';
              return 'color-github-1';
            }}
            tooltipDataAttrs={value => ({
              'data-tip': value.date ? `${value.date}: ${value.count} submissions` : '',
            })}
            showWeekdayLabels={true}
          />
        </div>
        
        {/* Existing Statistics Sections */}
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="bg-blue-50 p-4 rounded-md shadow-sm border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Overall Progress</h2>
            <p className="text-lg">Total Problems Solved: <span className="font-bold text-blue-600">{userStats.totalSolved}</span></p>
          </div>

          {/* Solved by Difficulty */}
          <div className="bg-green-50 p-4 rounded-md shadow-sm border border-green-200">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Solved by Difficulty</h2>
            {Object.keys(userStats.solvedByDifficulty).length > 0 ? (
              <div className="max-w-xs mx-auto">
                <Pie
                  data={{
                    labels: Object.keys(userStats.solvedByDifficulty),
                    datasets: [{
                      data: Object.values(userStats.solvedByDifficulty),
                      backgroundColor: ['#4ade80', '#22d3ee', '#facc15', '#f87171'],
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    }],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#166534'
                        }
                      }
                    }
                  }}
                  height={200}
                />
              </div>
            ) : (
              <p className="text-md text-gray-600">No problems solved yet by difficulty.</p>
            )}
            {Object.keys(userStats.solvedByDifficulty).length > 0 && (
              <ul className="list-disc list-inside mt-4 text-green-800">
                {Object.entries(userStats.solvedByDifficulty).map(([difficulty, count]) => (
                  <li key={difficulty} className="text-md">
                    {difficulty}: <span className="font-medium">{count}</span> problems
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Solved by Tag */}
          <div className="bg-purple-50 p-4 rounded-md shadow-sm border border-purple-200">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">Solved by Tag</h2>
            {Object.keys(userStats.solvedByTag).length > 0 ? (
              <div className="max-w-xs mx-auto">
                <Pie
                  data={{
                    labels: Object.keys(userStats.solvedByTag),
                    datasets: [{
                      data: Object.values(userStats.solvedByTag),
                      backgroundColor: [
                        '#c084fc', '#a78bfa', '#818cf8', '#60a5fa',
                        '#38bdf8', '#22d3ee', '#34d399', '#4ade80',
                        '#facc15', '#fcd34d', '#fbbf24', '#f97316'
                      ],
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    }],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#6b21a8'
                        }
                      }
                    }
                  }}
                  height={200}
                />
              </div>
            ) : (
              <p className="text-md text-gray-600">No problems solved yet by tag.</p>
            )}
            {Object.keys(userStats.solvedByTag).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(userStats.solvedByTag).map(([tag, count]) => (
                  <span key={tag} className="bg-purple-200 text-purple-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                    {tag} ({count})
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* List of Solved Problem Numbers */}
          <div className="bg-yellow-50 p-4 rounded-md shadow-sm border border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Solved Problems</h2>
            {userStats.solvedProblems && userStats.solvedProblems.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userStats.solvedProblems.sort((a, b) => a.problemNumber - b.problemNumber).map(problem => (
                  <Link
                    key={problem.problemNumber}
                    to={`/home/${problem.problemNumber}`}
                    className="bg-yellow-200 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm hover:bg-yellow-300 transition-colors"
                  >
                    {problem.problemNumber}. {problem.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-md text-gray-600">No problems solved yet.</p>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;