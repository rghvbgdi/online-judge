import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createProblem as createProblemAPI, deleteProblem as deleteProblemAPI, checkAdminStatus, fetchAllProblems } from "./apis/auth";
const AdminProblemManager = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    input: '',
    output: '',
    difficulty: '',
    tags: '', // Added tags to formData
    hiddenTestCases: []
  });
  const [problemNumberToDelete, setProblemNumberToDelete] = useState('');
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

  const fetchProblems = async () => {
    try {
      const res = await fetchAllProblems();
      setProblems(res.data);
    } catch (err) {
      console.error("Failed to fetch problems");
    }
  };

  // Function to check if the form is valid
  const isFormValid = () => {
    return formData.title && formData.description && formData.input && formData.output && formData.difficulty; // Tags are optional for now
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        await checkAdminStatus();
        setIsAdmin(true);
      } catch (err) {
        navigate("/");
      }
    };
    checkAdmin();
    fetchProblems();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === 'difficulty' ? (value === '' ? '' : parseInt(value)) : value;
    setFormData({ ...formData, [name]: parsedValue });
  };

  // Bulk JSON input for hidden test cases
  const [hiddenTestCasesJSON, setHiddenTestCasesJSON] = useState('');
  const [hiddenTestCasesError, setHiddenTestCasesError] = useState('');

  // Sync formData.hiddenTestCases with textarea JSON string
  useEffect(() => {
    // Only update textarea if hiddenTestCases changed and textarea not being edited
    setHiddenTestCasesJSON(
      formData.hiddenTestCases.length > 0
        ? JSON.stringify(formData.hiddenTestCases, null, 2)
        : ''
    );
  }, [formData.hiddenTestCases]);

  const handleHiddenTestCasesJSONChange = (e) => {
    const value = e.target.value;
    setHiddenTestCasesJSON(value);
    if (value.trim() === '') {
      setFormData({ ...formData, hiddenTestCases: [] });
      setHiddenTestCasesError('');
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setHiddenTestCasesError('JSON must be an array of test cases.');
        return;
      }
      // Validate each test case has 'input' and 'output'
      for (const t of parsed) {
        if (
          typeof t !== 'object' ||
          typeof t.input !== 'string' ||
          typeof t.output !== 'string'
        ) {
          setHiddenTestCasesError('Each test case must be an object with "input" and "output" strings.');
          return;
        }
      }
      setFormData({ ...formData, hiddenTestCases: parsed });
      setHiddenTestCasesError('');
    } catch (err) {
      setHiddenTestCasesError('Invalid JSON format.');
    }
  };

  const createProblem = async () => {
    try {
      const {
        title,
        description,
        input,
        output,
        difficulty,
        tags,
        hiddenTestCases
      } = formData;

      console.log("Sending problem to backend:", {
        title,
        description,
        input,
        output,
        difficulty,
        tags,
        hiddenTestCases: hiddenTestCases || []
      });

      const res = await createProblemAPI(
        {
          title,
          description,
          input,
          output,
          difficulty,
          tags,
          hiddenTestCases: hiddenTestCases || []
        },
      );

      setMessage(`Problem created successfully.`);
      fetchProblems(); // Refresh the list of problems
      setFormData({
        title: '',
        description: '',
        input: '',
        output: '',
        difficulty: '',
        tags: '',
        hiddenTestCases: []
      }); // Reset form
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create problem');
    }
  };

  const deleteProblem = async () => {
    try {
      const res = await deleteProblemAPI(problemNumberToDelete);
      setMessage(res.data.message);
      fetchProblems();
      setProblemNumberToDelete('');
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage(`Problem ${problemNumberToDelete} does not exist.`);
      } else if (err.response?.status === 400) {
        setMessage(`Invalid problem number: ${problemNumberToDelete}.`);
      } else {
        setMessage(err.response?.data?.message || 'Failed to delete problem.');
      }
    }
  };

  if (!isAdmin) return <p>Loading...</p>;
 

  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-8">
      {/* Left column: Create a New Problem */}
      <div className="flex-1 space-y-6 bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold">Create a New Problem</h2>
        <div className="space-y-2">
          <label className="block font-medium">Title</label>
          <input type="text" name="title" placeholder="Title" className="input w-full px-3 py-2 border rounded-md" onChange={handleChange} value={formData.title} />
        </div>
        <div className="space-y-2">
          <label className="block font-medium">Description</label>
          <textarea name="description" placeholder="Description" rows={6} className="input w-full px-3 py-2 border rounded-md resize-y" onChange={handleChange} value={formData.description}></textarea>
        </div>
        {/* Sample Input/Output fields */}
        <div className="space-y-2">
          <label className="block font-medium">Sample Input</label>
          <textarea
            name="input"
            placeholder="Sample input here..."
            rows={4}
            className="input w-full px-3 py-2 border rounded-md resize-y"
            onChange={handleChange}
            value={formData.input}
          ></textarea>
        </div>
        <div className="space-y-2">
          <label className="block font-medium">Sample Output</label>
          <textarea
            name="output"
            placeholder="Expected output here..."
            rows={4}
            className="input w-full px-3 py-2 border rounded-md resize-y"
            onChange={handleChange}
            value={formData.output}
          ></textarea>
        </div>
        <div className="space-y-2">
          <label className="block font-medium">Difficulty</label>
          <input
            type="number"
            name="difficulty"
            placeholder="e.g., 800"
            className="input w-full px-3 py-2 border rounded-md"
            onChange={handleChange}
            value={formData.difficulty}
          />
        </div>
        <div className="space-y-2">
          <label className="block font-medium">Tags (comma-separated)</label>
          <input type="text" name="tags" placeholder="e.g., Array, String, Math" className="input w-full px-3 py-2 border rounded-md" onChange={handleChange} value={formData.tags} />
        </div>
        <div className="space-y-2">
          <label className="block font-medium mb-1">Hidden Test Cases (bulk JSON array)</label>
          <textarea
            rows={8}
            className="input w-full px-3 py-2 border rounded-md resize-y font-mono"
            placeholder={`Example:\n[\n  {"input": "1 2", "output": "3"},\n  {"input": "5 6", "output": "11"}\n]`}
            value={hiddenTestCasesJSON}
            onChange={handleHiddenTestCasesJSONChange}
          />
          {hiddenTestCasesError && (
            <p className="text-red-600 text-sm mt-1">{hiddenTestCasesError}</p>
          )}
        </div>
        <button
          className={`btn bg-green-600 text-white px-4 py-2 rounded-md w-full${!isFormValid() ? " disabled:opacity-50" : ""}`}
          onClick={createProblem}
          disabled={!isFormValid()}
        >
          Create Problem
        </button>
      </div>
      {/* Right column: Delete a Problem */}
      <div className="flex-1 space-y-6 bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold">Delete a Problem</h2>
        <div className="space-y-2">
          <label className="block font-medium">Problem Number</label>
          <select
            className="input w-full px-3 py-2 border rounded-md"
            value={problemNumberToDelete}
            onChange={(e) => setProblemNumberToDelete(e.target.value)}
          >
            <option value="">Select a problem</option>
            {problems.map((p) => (
              <option key={p.problemNumber} value={p.problemNumber}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <button
          className={`btn bg-red-600 text-white px-4 py-2 rounded-md w-full${!problemNumberToDelete ? " disabled:opacity-50" : ""}`}
          onClick={deleteProblem}
          disabled={!problemNumberToDelete}
        >
          Delete Problem
        </button>
        {message && <p className="text-sm text-blue-600 mt-1">{message}</p>}
      </div>
    </div>
  );
};

export default AdminProblemManager;