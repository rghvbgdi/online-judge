import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { fetchUserStats, fetchPublicProfile } from './apis/auth';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- SVG ICONS ---
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconBarChart = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconTag = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const IconCheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconAlertTriangle = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

// --- Helper Functions ---
const getAvatarInfo = (firstName, lastName) => {
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    if (!name) return { initials: '?', color: 'bg-slate-700 text-slate-400' };
    const parts = name.split(' ').filter(Boolean);
    const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : name.substring(0, 2);
    const avatarColors = ['bg-emerald-900 text-emerald-300', 'bg-sky-900 text-sky-300', 'bg-indigo-900 text-indigo-300', 'bg-rose-900 text-rose-300', 'bg-amber-900 text-amber-300', 'bg-violet-900 text-violet-300'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
    const color = avatarColors[Math.abs(hash % avatarColors.length)];
    return { initials: initials.toUpperCase(), color };
};

// --- Child Components ---
const StatCard = ({ icon, title, children, delay = 0 }) => (
    <div 
        className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/80 shadow-lg backdrop-blur-sm hover:shadow-xl hover:bg-slate-800/60 transition-all duration-500 ease-out hover:scale-[1.02] hover:border-slate-600/80"
        style={{ 
            animation: `fadeInUp 0.8s ease-out ${delay}s both`,
            transform: 'translateY(20px)',
            opacity: 0
        }}
    >
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-3">
            <span className="text-emerald-400 transition-transform duration-300 hover:scale-110">{icon}</span>
            {title}
        </h2>
        <div className="text-slate-300">{children}</div>
    </div>
);

const StatCardSkeleton = () => (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/80 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-5 animate-shimmer"></div>
        <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded w-full animate-shimmer"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6 animate-shimmer"></div>
        </div>
    </div>
);

// --- Main Profile Page Component ---
const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const { userId } = useParams();

    useEffect(() => {
        const getUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                const statsRes = userId ? await fetchPublicProfile(userId) : await fetchUserStats();
                setUserStats(statsRes.data);
                setTimeout(() => setIsVisible(true), 100);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to load user profile. The user may not exist or the server is unavailable.');
            } finally {
                setLoading(false);
            }
        };
        getUserData();
    }, [userId]);

    const { difficultyData, tagData, chartOptions } = useMemo(() => {
        if (!userStats) return { difficultyData: null, tagData: null, chartOptions: null };
        
        // Fixed color mapping for difficulties
        const getDifficultyColors = (labels) => {
            const colorMap = {
                'Easy': '#34d399',    // green
                'Medium': '#fbbf24',  // yellow
                'Hard': '#f87171'     // red
            };
            return labels.map(label => colorMap[label] || '#64748b');
        };
        
        const difficultyLabels = Object.keys(userStats.solvedByDifficulty || {});
        const difficultyData = {
            labels: difficultyLabels,
            datasets: [{
                data: Object.values(userStats.solvedByDifficulty || {}),
                backgroundColor: getDifficultyColors(difficultyLabels),
                borderColor: '#1f2937',
                borderWidth: 4,
                hoverBackgroundColor: getDifficultyColors(difficultyLabels).map(color => color + 'CC'),
                hoverBorderWidth: 6,
                hoverBorderColor: '#0f172a',
            }],
        };
        
        const tagData = {
            labels: Object.keys(userStats.solvedByTag || {}),
            datasets: [{
                data: Object.values(userStats.solvedByTag || {}),
                backgroundColor: ['#38bdf8', '#818cf8', '#c084fc', '#fb923c', '#4ade80', '#f472b6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'],
                borderColor: '#1f2937',
                borderWidth: 4,
                hoverBackgroundColor: ['#38bdf8CC', '#818cf8CC', '#c084fcCC', '#fb923cCC', '#4ade80CC', '#f472b6CC', '#06b6d4CC', '#8b5cf6CC', '#f59e0bCC', '#ef4444CC'],
                hoverBorderWidth: 6,
                hoverBorderColor: '#0f172a',
            }],
        };
        
        const chartOptions = {
            maintainAspectRatio: false,
            responsive: true,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeOutCubic'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    padding: 12,
                    cornerRadius: 12,
                    borderColor: '#334155',
                    borderWidth: 1,
                    displayColors: true,
                    animation: {
                        duration: 300,
                        easing: 'easeOutQuart'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'point'
            },
            elements: {
                arc: {
                    hoverOffset: 8,
                    borderRadius: 4
                }
            }
        };
        
        return { difficultyData, tagData, chartOptions };
    }, [userStats]);

    // Add custom CSS for animations
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }
            
            .animate-shimmer {
                background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
                background-size: 1000px 100%;
                animation: shimmer 2s infinite;
            }
            
            @keyframes countUp {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            .animate-count-up {
                animation: countUp 1s ease-out;
            }
            
            @keyframes slideInLeft {
                from { transform: translateX(-50px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .animate-slide-in-left {
                animation: slideInLeft 0.6s ease-out;
            }
            
            @keyframes bounce-subtle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-2px); }
            }
            
            .hover-bounce:hover {
                animation: bounce-subtle 0.6s ease-in-out;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col items-center mb-12">
                        <div className="w-28 h-28 rounded-full bg-slate-700 animate-pulse mb-4"></div>
                        <div className="h-8 bg-slate-700 rounded w-1/3 animate-pulse mb-3"></div>
                        <div className="h-5 bg-slate-700 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="space-y-6">
                        <StatCardSkeleton />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><StatCardSkeleton /><StatCardSkeleton /></div>
                        <StatCardSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                <div 
                    className="text-center bg-slate-800 p-8 rounded-2xl shadow-lg border border-rose-500/30 transform transition-all duration-500 hover:scale-105"
                    style={{ animation: 'fadeInUp 0.6s ease-out' }}
                >
                    <div className="text-rose-500 mx-auto mb-4 animate-bounce"><IconAlertTriangle /></div>
                    <h2 className="text-xl font-semibold text-slate-100 mb-1">An Error Occurred</h2>
                    <p className="text-rose-400 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (!userStats) return null;

    const avatar = getAvatarInfo(userStats.firstname, userStats.lastname);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <header 
                    className="text-center mb-12"
                    style={{ 
                        animation: isVisible ? 'fadeInUp 1s ease-out' : 'none',
                        opacity: isVisible ? 1 : 0 
                    }}
                >
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center font-bold text-4xl mx-auto mb-4 shadow-lg border-2 border-slate-700 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:border-emerald-500/50 ${avatar.color}`}>
                        {avatar.initials}
                    </div>
                    <h1 className="text-4xl font-bold text-slate-50 mb-1 transition-colors duration-300 hover:text-emerald-400">
                        {userId ? `${userStats.firstname} ${userStats.lastname}` : 'Your Profile'}
                    </h1>
                    <p className="text-slate-400 text-lg">Coding journey and achievements</p>
                </header>
                
                <main className="space-y-6">
                    <StatCard icon={<IconUser />} title="User Information" delay={0.1}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                                <span className="text-slate-400 block mb-1">Name</span>
                                <p className="font-semibold text-slate-200 text-base">{userStats.firstname} {userStats.lastname}</p>
                            </div>
                            {userStats.email && (
                                <div className="animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
                                    <span className="text-slate-400 block mb-1">Email</span>
                                    <p className="font-semibold text-slate-200 text-base">{userStats.email}</p>
                                </div>
                            )}
                            {userStats.joinedAt && (
                                <div className="animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                                    <span className="text-slate-400 block mb-1">Joined</span>
                                    <p className="font-semibold text-slate-200 text-base">{new Date(userStats.joinedAt).toLocaleDateString()}</p>
                                </div>
                            )}
                        </div>
                    </StatCard>

                    <StatCard icon={<IconBarChart />} title="Overall Progress" delay={0.2}>
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-6xl font-bold text-emerald-400 mb-2 animate-count-up hover-bounce cursor-default">
                                    {userStats.totalSolved || 0}
                                </div>
                                <div className="text-slate-400 font-medium">
                                    {userStats.totalQuestions ? `Solved out of ${userStats.totalQuestions} problems` : 'Total Problems Solved'}
                                </div>
                                {userStats.totalQuestions > 0 && (
                                    <div className="mt-4 max-w-md mx-auto">
                                        <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2.5 rounded-full transition-all duration-2000 ease-out" 
                                                style={{ 
                                                    width: `${((userStats.totalSolved || 0) / userStats.totalQuestions) * 100}%`,
                                                    animation: 'slideInLeft 2s ease-out'
                                                }}
                                            ></div>
                                        </div>
                                        <div className="text-sm text-slate-400 mt-2 font-medium">
                                            {(((userStats.totalSolved || 0) / userStats.totalQuestions) * 100).toFixed(1)}% Complete
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Detailed Progress Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-700/30 p-4 rounded-lg text-center transition-all duration-300 hover:bg-green-900/20 hover:scale-105 animate-slide-in-left" style={{ animationDelay: '0.5s' }}>
                                    <div className="text-2xl font-bold text-green-400 mb-1 hover-bounce">
                                        {userStats.solvedByDifficulty?.Easy || 0}
                                    </div>
                                    <div className="text-sm text-slate-400">Easy Problems</div>
                                </div>
                                <div className="bg-slate-700/30 p-4 rounded-lg text-center transition-all duration-300 hover:bg-yellow-900/20 hover:scale-105 animate-slide-in-left" style={{ animationDelay: '0.6s' }}>
                                    <div className="text-2xl font-bold text-yellow-400 mb-1 hover-bounce">
                                        {userStats.solvedByDifficulty?.Medium || 0}
                                    </div>
                                    <div className="text-sm text-slate-400">Medium Problems</div>
                                </div>
                                <div className="bg-slate-700/30 p-4 rounded-lg text-center transition-all duration-300 hover:bg-red-900/20 hover:scale-105 animate-slide-in-left" style={{ animationDelay: '0.7s' }}>
                                    <div className="text-2xl font-bold text-red-400 mb-1 hover-bounce">
                                        {userStats.solvedByDifficulty?.Hard || 0}
                                    </div>
                                    <div className="text-sm text-slate-400">Hard Problems</div>
                                </div>
                            </div>
                        </div>
                    </StatCard>

                    <StatCard icon={<IconCalendar />} title="Submission Heatmap" delay={0.3}>
                        <div className="transition-all duration-500 hover:scale-[1.01]">
                            <CalendarHeatmap
                                startDate={oneYearAgo}
                                endDate={today}
                                values={userStats.submissionHistory || []}
                                classForValue={(value) => {
                                    if (!value || value.count === 0) return 'color-empty';
                                    if (value.count >= 4) return 'color-github-4';
                                    if (value.count >= 3) return 'color-github-3';
                                    if (value.count >= 2) return 'color-github-2';
                                    return 'color-github-1';
                                }}
                                tooltipDataAttrs={value => ({ 'data-tip': `${value.date || 'N/A'}: ${value.count || 0} submissions` })}
                                showWeekdayLabels={true}
                            />
                        </div>
                    </StatCard>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StatCard icon={<IconTarget />} title="Solved by Difficulty" delay={0.4}>
                            {difficultyData && difficultyData.labels.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="h-64 transition-all duration-300 hover:scale-105">
                                        <Pie data={difficultyData} options={chartOptions} />
                                    </div>
                                    <div className="space-y-3">
                                        {Object.entries(userStats.solvedByDifficulty || {}).map(([difficulty, count], index) => {
                                            const colors = {
                                                'Easy': 'bg-green-500',
                                                'Medium': 'bg-yellow-500', 
                                                'Hard': 'bg-red-500'
                                            };
                                            const textColors = {
                                                'Easy': 'text-green-400',
                                                'Medium': 'text-yellow-400',
                                                'Hard': 'text-red-400'
                                            };
                                            const hoverColors = {
                                                'Easy': 'hover:bg-green-900/20',
                                                'Medium': 'hover:bg-yellow-900/20',
                                                'Hard': 'hover:bg-red-900/20'
                                            };
                                            return (
                                                <div 
                                                    key={difficulty} 
                                                    className={`flex items-center justify-between p-3 bg-slate-700/30 rounded-lg transition-all duration-300 hover:scale-[1.02] ${hoverColors[difficulty]} animate-slide-in-left`}
                                                    style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${colors[difficulty] || 'bg-slate-500'} transition-transform duration-300 hover:scale-125`}></div>
                                                        <span className={`font-medium ${textColors[difficulty] || 'text-slate-300'}`}>{difficulty}</span>
                                                    </div>
                                                    <span className="font-bold text-slate-200 text-lg hover-bounce">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-400 text-center py-8">No difficulty data available</p>
                            )}
                        </StatCard>
                        <StatCard icon={<IconTag />} title="Solved by Tag" delay={0.5}>
                            {tagData && tagData.labels.length > 0 ? (
                                <div className="h-80 transition-all duration-300 hover:scale-105">
                                    <Pie data={tagData} options={chartOptions} />
                                </div>
                            ) : (
                                <p className="text-slate-400 text-center py-8">No tag data available</p>
                            )}
                        </StatCard>
                    </div>

                    <StatCard icon={<IconCheckCircle />} title="Recently Solved Problems" delay={0.6}>
                        {userStats.solvedProblems?.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    {userStats.solvedProblems.slice(0, 10).map((p, index) => 
                                        <Link 
                                            key={p.problemNumber} 
                                            to={`/problems/${p.problemNumber}`} 
                                            className="bg-emerald-900/70 text-emerald-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-800/80 hover:text-emerald-200 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-in-left"
                                            style={{ animationDelay: `${1.2 + index * 0.05}s` }}
                                        >
                                            {p.problemNumber}. {p.title}
                                        </Link>
                                    )}
                                </div>
                                {userStats.solvedProblems.length > 10 && (
                                    <div className="text-center animate-slide-in-left" style={{ animationDelay: '1.7s' }}>
                                        <span className="text-slate-400 text-sm">
                                            ...and {userStats.solvedProblems.length - 10} more problems
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : <p className="text-slate-400 text-center py-4">No problems solved yet. Time to get started!</p>}
                    </StatCard>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;