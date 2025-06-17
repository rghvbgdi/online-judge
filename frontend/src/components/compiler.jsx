import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import axios from 'axios';

function Compiler({ initialCode = "", problemId }) {
  const [code, setCode] = useState(initialCode);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');

  const handleSubmit = async () => {
    const payload = { language, code, input };
    try {
      const  data  = await axios.post(import.meta.env.VITE_BACKEND_URL2, payload);
      setOutput(data.output);
    } catch (error) {
      console.log(error.response);
    }
  };

  const handleFinalSubmit = async () => {
    const payload = {
      code,
      language,
      problemNumber: problemId,
    };

    try {
      const { data } = await axios.post('http://localhost:3000/submit', payload);
      console.log(data);
      setOutput(data.verdict + "\n" + JSON.stringify(data.results, null, 2));
    } catch (error) {
      console.error("Submit error:", error?.response?.data || error.message);
      setOutput('Submission failed. Please check the console for details.');
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <div className="mb-2 w-full max-w-lg">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border border-gray-300 rounded-md py-1.5 px-4 focus:outline-none focus:border-indigo-500"
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>
      <div className="bg-gray-100 shadow-md w-full max-w-lg mb-4 border border-gray-300" style={{ height: '600px', overflowY: 'auto' }}>
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            outline: 'none',
            border: 'none',
            backgroundColor: '#f7fafc',
            height: '100%',
            overflowY: 'auto'
          }}
        />
      </div>

      <input
        type="text"
        placeholder="Enter input for the program"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="mb-4 border border-gray-300 rounded-md py-1.5 px-4 focus:outline-none focus:border-indigo-500"
      />

      <div className="flex">
        <button
          onClick={handleSubmit}
          type="button"
          className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
        >
          Run
        </button>

        <button
          onClick={handleFinalSubmit}
          type="button"
          className="ml-2 text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
        >
          Submit
        </button>
      </div>

      {output && (
        <div className="outputbox mt-4 bg-gray-100 rounded-md shadow-md p-4 w-full max-w-lg">
          <p style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 12 }}>{output}</p>
        </div>
      )}
    </div>
  );
}

export default Compiler;