import NotFound from "../notFound.jsx";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Split from "react-split";
import { fetchProblemByNumber, runCode, submitCode } from '../apis/auth.jsx';
import Editor from '@monaco-editor/react';

// Helper to get boilerplate code based on language
const getBoilerplateCode = (lang, problemTitle) => {
  switch (lang) {
    case 'cpp':
      return `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n\nint main() {\n    std::ios_base::sync_with_stdio(false);\n    std::cin.tie(NULL);\n    // Start coding for ${problemTitle}\n\n    return 0;\n}`;
    case 'python':
      return `# Start coding for ${problemTitle}\n\ndef solve():\n    pass # Your solution here\n\nif __name__ == "__main__":\n    solve()`;
    case 'javascript':
      return `// Start coding for ${problemTitle}\n\nfunction solve() {\n    // Your solution here\n}\n\nsolve();`;
    default:
      return `// Start coding for ${problemTitle}\n\n`; // Fallback
  }
};

const ProblemDetails = () => {
  const { problemNumber } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false); // State for "Run" button
  const [isSubmitting, setIsSubmitting] = useState(false); // State for "Submit" button
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');



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
      }
      finally {
        setLoading(false); // Always set loading to false after fetch attempt
      }
    };

    fetchProblem();
  }, [problemNumber]);

  // Initialize code state when problem is loaded
  // And update code state when language changes, prioritizing saved state from cookies
  useEffect(() => {
    if (problem && problem?.title) {
      // Try to load last used language for this problem from cookies
      const savedLanguage = localStorage.getItem(`problem_${problemNumber}_language`);
      const initialLanguage = savedLanguage || 'cpp'; // Default to cpp if no saved language
      setLanguage(initialLanguage); // Set the language state

      // Try to load saved code for this problem and language from cookies
      const savedCode = localStorage.getItem(`problem_${problemNumber}_code_${initialLanguage}`);
      // If savedCode is null (never saved before), use boilerplate. Otherwise, use the saved value (even if it's an empty string).
      const initialCode = savedCode !== null ? savedCode : getBoilerplateCode(initialLanguage, problem.title);
      setCode(initialCode);

      // Try to load saved input for this problem and language from cookies
      const savedInput = localStorage.getItem(`problem_${problemNumber}_input_${initialLanguage}`);
      setInput(savedInput ?? '');
    }
  }, [problem, problemNumber]); // Rerun only when problem data is loaded
    
      // Effect to save code, input, and language to cookies whenever they change
  useEffect(() => {
    // Do not save to localStorage while the problem is loading. This prevents overwriting saved data with initial empty state.
    if (!loading && problemNumber && language) {
      localStorage.setItem(`problem_${problemNumber}_language`, language);
      localStorage.setItem(`problem_${problemNumber}_code_${language}`, code);
      localStorage.setItem(`problem_${problemNumber}_input_${language}`, input);
    }
  }, [code, input, language, problemNumber, loading]); // Dependencies for saving


  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    const currentBoilerplate = getBoilerplateCode(language, problem?.title || "");
    const newBoilerplate = getBoilerplateCode(newLanguage, problem?.title || "");
    const savedCodeForNewLang = localStorage.getItem(`problem_${problemNumber}_code_${newLanguage}`);
    // A language is considered "first time" used only if there's no entry for it in localStorage (i.e., it's null).
    const isNewLangFirstTime = savedCodeForNewLang === null;

    // If the user hasn't changed the boilerplate, or if they are switching to a language for the first time, show new boilerplate.
    if (code.trim() === currentBoilerplate.trim() || isNewLangFirstTime) {
      setCode(newBoilerplate);
    } else {
      // Otherwise, load their previously saved code for the new language.
      setCode(savedCodeForNewLang ?? ''); // Use saved code, fallback to empty string
    }

    setLanguage(newLanguage);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(''); // Clear previous output for a new run
    try {
      const { data } = await runCode(code, input, language);
      setOutput(data.output);
    } catch (error) {
      console.error("Run error:", error?.response?.data || error.message);
      setOutput(error?.response?.data?.output || '❌ Failed to run code. Please check the console for details.');
    }finally {
      setIsRunning(false); // Reset loading state
    }
  };

  const handleFinalSubmit = async () => {
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
          // Format a detailed message for Wrong Answer
          let result = `${data.verdict} on Test Case ${data.testCaseNumber}\n\n`;
          result += `Input:\n${data.failedTestCase.input}\n\n`;
          result += `Expected Output:\n${data.failedTestCase.expectedOutput}\n\n`;
          result += `Your Output:\n${data.failedTestCase.actualOutput}`;
          setOutput(result);
        } else {
          // For "Accepted" verdict
          setOutput(data.verdict);
        }
      } else if (data.output) {
        // For Compile Error, Runtime Error, TLE from the compiler
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

  if (loading) return <p>Loading problem...</p>;
  if (error === "notfound") return <NotFound />;
  if (error === "other") return <p className="text-red-600">Something went wrong. Please try again.</p>;

  // Ensure problem object exists before trying to access its properties
  if (!problem) return <p className="p-6 text-center">Problem data is not available.</p>;

  const difficultyValue = problem.difficulty;

  return (
    <div className="h-screen bg-gray-50">
      <Split
        sizes={[60, 40]} // Initial sizes: 60% for problem details, 40% for code editor
        minSize={[30, 30]} // Minimum size for each panel
        gutterSize={10}
        className="flex"
      >
        {/* Problem Details Panel */}
        <div className="bg-white shadow-xl rounded-lg p-6 overflow-y-auto">
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
        <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded">
          <p className="text-sm font-semibold text-gray-800">
            Difficulty: <span className="font-bold text-gray-800">{difficultyValue}</span>
          </p>
        </div>

      </div>

        {/* Code Editor Panel */}
        <div className="bg-white shadow-xl rounded-lg p-6 overflow-y-auto flex flex-col">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Language</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e)}
            className="w-full border border-gray-300 rounded-md py-1.5 px-4 focus:outline-none focus:border-indigo-500"
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
        <div className="flex-grow w-full border border-gray-300 rounded-md mb-4 overflow-hidden relative">
          {/* The wrapper is a flex item and a positioning context for the editor */}
          <Editor
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="light"
            options={{
              minimap: { enabled: false }, // Disabled for a simpler look
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true, // Crucial for the editor to resize with its container
              padding: { // Added padding for better aesthetics
                top: 10,
              },
            }}
          />
        </div>
        <h2 className="text-xl font-semibold mb-2">Input</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm resize-none mb-4"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          spellCheck={false}
        />
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            onClick={handleFinalSubmit}
            disabled={isRunning || isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
        <h2 className="text-xl font-semibold mb-2">Output</h2>
        <pre
          className="whitespace-pre-wrap font-mono text-gray-700 bg-gray-100 p-4 rounded-md min-h-[100px] overflow-auto"
        >
          {output}
        </pre>
      </div>
      </Split>
    </div>
  );
};

export default ProblemDetails;