import NotFound from "../notFound.jsx";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Split from "react-split";
import { fetchProblemByNumber, runCode, submitCode, getAIFeedback } from '../apis/auth.jsx';
import Editor from '@monaco-editor/react';

// Helper to get boilerplate code based on language
const getBoilerplateCode = (lang, problemTitle) => {
  switch (lang) {
    case 'cpp':
      return `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Start coding for ${problemTitle}
    cout << "Hello, World!" << endl;

    return 0;
}`;
    case 'python':
      return `# Start coding for ${problemTitle}\n\ndef solve():\n    pass # Your solution here\n\nif __name__ == "__main__":\n    solve()`;
    case 'javascript':
      return `// Start coding for ${problemTitle}\n\nfunction solve() {\n    // Your solution here\n}\n\nsolve();`;
    default:
      return `// Start coding for ${problemTitle}\n\n`; // Fallback
  }
};

const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10',
  };
  const style = styles[difficulty] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <span className={`px-4 py-1.5 text-xs font-medium rounded-full border backdrop-blur-sm shadow-lg ${style}`}>
      {difficulty}
    </span>
  );
};

const ProblemDetails = () => {
  const { problemNumber } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [aiFeedback, setAIFeedback] = useState('');
  const [aiFeedbackLoading, setAIFeedbackLoading] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('input');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [expandEditor, setExpandEditor] = useState(false);
  const [aiModalPosition, setAIModalPosition] = useState({ x: null, y: null });
  const aiModalRef = useRef(null);

  // Handler for AI Feedback button
  const handleAIFeedback = () => {
    setIsAiModalOpen(true);
    setAIFeedbackLoading(true);
    setAIFeedback('');

    getAIFeedback({
      code: code || '',
      language: language || 'cpp',
      title: problem?.title || '',
      description: problem?.description || '',
      input: problem?.input || '',
      output: problem?.output || '',
    })
      .then((response) => {
        setAIFeedback(response.data.feedback || "No suggestions from AI.");
      })
      .catch((err) => {
        console.error("AI feedback error:", err);
        setAIFeedback("❌ Failed to get feedback.");
      })
      .finally(() => {
        setAIFeedbackLoading(false);
      });
  };

  // Fetch problem data
  useEffect(() => { 
    const fetchProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchProblemByNumber(problemNumber);
        setProblem(response.data);
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 400)) {
          setProblem(null);
          setError("notfound");
        } else {
          setError("other");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemNumber]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [problemNumber]);
  
  // Set initial language once problem is loaded
  useEffect(() => {
    if (problem) {
      const savedLanguage = localStorage.getItem(`problem_${problemNumber}_language`) || 'cpp';
      setLanguage(savedLanguage);
    }
  }, [problem, problemNumber]);

  // Load code and input whenever language or problem changes
  useEffect(() => {
    if (problem && language) {
      const savedCode = localStorage.getItem(`problem_${problemNumber}_code_${language}`);
      const boilerplate = getBoilerplateCode(language, problem.title);
      setCode(savedCode || boilerplate);

      const savedInput = localStorage.getItem(`problem_${problemNumber}_input_${language}`);
      setInput(savedInput ?? '');
    }
  }, [language, problem]);

  // This effect saves data to localStorage.
  useEffect(() => {
    if (!loading && problemNumber && language) {
      localStorage.setItem(`problem_${problemNumber}_language`, language);
      localStorage.setItem(`problem_${problemNumber}_code_${language}`, code);
      localStorage.setItem(`problem_${problemNumber}_input_${language}`, input);
    }
  }, [code, input, language, problemNumber, loading]);

  useEffect(() => {
    const listener = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleRunCode();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [code, input]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  // Reset code to boilerplate
  const handleResetCode = () => {
    const boilerplate = getBoilerplateCode(language, problem.title);
    setCode(boilerplate);
  };

  const handleRunCode = async () => {
    setActiveConsoleTab('output');
    setIsRunning(true);
    setOutput('');
    try {
      const start = Date.now();
      const { data } = await runCode(code, input, language);
      const duration = Date.now() - start;
      setOutput(`${data.output}\n\n⏱ Execution Time: ${duration}ms`);
    } catch (error) {
      console.error("Run error:", error?.response?.data || error.message);
      setOutput(error?.response?.data?.output || '❌ Failed to run code. Please check the console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFinalSubmit = async () => {
    setActiveConsoleTab('output');
    if (!code.trim()) {
      setOutput("❌ Please write some code before submitting.");
      return;
    }

    setIsSubmitting(true);
    setOutput("Submitting...");

    try {
      const { data } = await submitCode(code, language, problemNumber);

      if (data.verdict) {
        if (data.verdict === "❌ Wrong Answer") {
          let result = `${data.verdict} on Test Case ${data.testCaseNumber}\n\n`;
          result += `Input:\n${data.failedTestCase.input}\n\n`;
          result += `Expected Output:\n${data.failedTestCase.expectedOutput}\n\n`;
          result += `Your Output:\n${data.failedTestCase.actualOutput}`;
          setOutput(result);
        } else {
          setOutput(data.verdict);
        }
      } else if (data.output) {
        setOutput(data.output);
      } else {
        setOutput("An unexpected response was received from the server.");
      }
    } catch (error) {
      console.error("Submit error:", error?.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        setOutput('❌ Please log in to submit code.');
      } else {
        setOutput('❌ Submission failed. Please check the console for details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/30 border-t-blue-500"></div>
        <p className="text-slate-400 font-medium">Loading Problem...</p>
      </div>
    </div>
  );
  
  if (error === "notfound") return <NotFound />;
  
  if (error === "other") return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <p className="text-red-400 font-medium">Something went wrong. Please try again.</p>
      </div>
    </div>
  );

  if (!problem) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <p className="text-slate-400 font-medium">Problem data is not available.</p>
    </div>
  );

  const difficultyValue = problem.difficulty;

  return (
    <div className="bg-slate-950 antialiased text-slate-200 h-screen overflow-hidden">
      {/* AI Modal */}
      {isAiModalOpen && (
        <div
          ref={aiModalRef}
          className={`fixed max-w-[600px] w-[92vw] max-h-[60vh] bg-slate-900 rounded-2xl shadow-2xl p-6 z-50 transition-all duration-300 ease-out cursor-move border border-slate-700 ${
            isAiModalOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
          }`}
          style={{
            top: aiModalPosition.y !== null ? aiModalPosition.y : '50%',
            left: aiModalPosition.x !== null ? aiModalPosition.x : '50%',
            transform: aiModalPosition.x === null && aiModalPosition.y === null ? 'translate(-50%, -50%)' : undefined,
          }}
          onMouseDown={(e) => {
            const modal = aiModalRef.current;
            if (!modal || e.target !== modal) return;
            const startX = e.clientX;
            const startY = e.clientY;
            const rect = modal.getBoundingClientRect();
            let offsetX = startX - rect.left;
            let offsetY = startY - rect.top;
            const handleMouseMove = (moveEvent) => {
              let newX = moveEvent.clientX - offsetX;
              let newY = moveEvent.clientY - offsetY;
              const maxX = window.innerWidth - rect.width;
              const maxY = window.innerHeight - rect.height;
              newX = Math.max(0, Math.min(newX, maxX));
              newY = Math.max(0, Math.min(newY, maxY));
              setAIModalPosition({ x: newX, y: newY });
            };
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-200 select-none flex items-center">
              <span className="mr-2">🤖</span> AI Feedback
            </h2>
            <button
              onClick={() => {
                setIsAiModalOpen(false);
                setAIModalPosition({ x: null, y: null });
              }}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="whitespace-pre-wrap font-mono text-sm text-slate-300 bg-slate-800 p-4 rounded-xl overflow-auto max-h-[calc(60vh-120px)] border border-slate-700">
            {aiFeedbackLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500/30 border-t-purple-500"></div>
                <span>Loading AI Feedback...</span>
              </div>
            ) : aiFeedback}
          </div>
        </div>
      )}
      {isAiModalOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsAiModalOpen(false)}></div>}

      <Split
        sizes={expandEditor ? [0, 100] : [50, 50]}
        minSize={[500, 400]}
        gutterSize={12}
        gutterStyle={() => ({
          backgroundColor: '#0f172a',
          border: '2px solid #1e293b',
          borderRadius: '6px',
          cursor: 'col-resize',
        })}
        className="h-full flex"
      >
        {/* Problem Details Panel */}
        <div className="bg-slate-900 p-8 overflow-y-auto border-r border-slate-800 h-full">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-slate-100 leading-tight">{problem.title}</h1>
            <DifficultyBadge difficulty={difficultyValue} />
          </div>

          {problem.tags && problem.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <span className="mr-2">📝</span> Problem Description
              </h2>
              <div className="whitespace-normal font-mono text-slate-300 text-sm leading-relaxed bg-slate-800 p-4 rounded-xl border border-slate-700">
                {(problem.description || "No description available.").split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <span className="mr-2">📥</span> Input Format
              </h2>
              <div className="whitespace-normal font-mono text-slate-300 text-sm leading-relaxed bg-slate-800 p-4 rounded-xl border border-slate-700">
                {(problem.input || "No input format specified.").split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <span className="mr-2">📤</span> Output Format
              </h2>
              <div className="whitespace-normal font-mono text-slate-300 text-sm leading-relaxed bg-slate-800 p-4 rounded-xl border border-slate-700">
                {(problem.output || "No output format specified.").split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="bg-slate-900 flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e)}
                    className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <button
                  onClick={handleResetCode}
                  className="mt-6 px-4 py-2 bg-amber-600 text-amber-100 rounded-lg hover:bg-amber-700 border border-amber-500 text-sm font-medium transition-colors"
                >
                  Reset Code
                </button>
              </div>
            </div>
          </div>
          
          {/* Editor */}
          <div className="flex-1 min-h-0 overflow-hidden bg-slate-900 border border-slate-800 rounded-lg m-2">
            <Editor
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              height="100%"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                automaticLayout: true,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                tabSize: 2,
              }}
            />
          </div>
          
          {/* Console Section */}
          <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900">
            {/* Console Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                  onClick={() => setActiveConsoleTab('input')} 
                  className={`px-4 py-2 text-sm rounded-md transition-all ${
                    activeConsoleTab === 'input' 
                      ? 'bg-slate-700 text-slate-200 shadow-lg' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }`}
                >
                  Input
                </button>
                <button 
                  onClick={() => setActiveConsoleTab('output')} 
                  className={`px-4 py-2 text-sm rounded-md transition-all ${
                    activeConsoleTab === 'output' 
                      ? 'bg-slate-700 text-slate-200 shadow-lg' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }`}
                >
                  Output
                </button>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleRunCode} 
                  disabled={isRunning || isSubmitting} 
                  className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors border border-slate-600 flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-slate-400 border-t-transparent"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <span>▶️</span>
                      Run Code
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={isRunning || isSubmitting} 
                  className="px-4 py-2 bg-emerald-600 text-emerald-100 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors border border-emerald-500 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-emerald-400 border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Submit
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleAIFeedback} 
                  className="px-4 py-2 bg-purple-600 text-purple-100 rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors border border-purple-500 flex items-center gap-2"
                >
                  <span>🤖</span>
                  AI Feedback
                </button>
              </div>
            </div>
            
            {/* Console Content */}
            <div className="px-4 pb-4 h-48 flex flex-col">
              {activeConsoleTab === 'input' && (
                <textarea
                  className="w-full h-full p-4 bg-slate-800 border border-slate-700 rounded-xl font-mono text-sm resize-none text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  spellCheck={false}
                  placeholder="Enter custom input here..."
                />
              )}
              {activeConsoleTab === 'output' && (
                <div className="h-full flex flex-col">
                  <div className="flex justify-end mb-2 flex-shrink-0">
                    <button 
                      onClick={() => navigator.clipboard.writeText(output)} 
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 hover:underline"
                    >
                      <span>📋</span> Copy Output
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-slate-300 bg-slate-800 p-4 rounded-xl flex-1 overflow-auto text-sm border border-slate-700">
                    {output || "Run or submit your code to see the output."}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </Split>
    </div>
  );
};

export default ProblemDetails;