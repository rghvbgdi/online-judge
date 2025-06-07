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

  const handleSubmit = async () => {
    const payload = { language: 'cpp', code, input };
    try {
      const { data } = await axios.post(import.meta.env.VITE_BACKEND_URL2, payload);
      setOutput(data.output);
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
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

      <button
        onClick={handleSubmit}
        type="button"
        className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
      >
        Run
      </button>

      {output && (
        <div className="outputbox mt-4 bg-gray-100 rounded-md shadow-md p-4 w-full max-w-lg">
          <p style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 12 }}>{output}</p>
        </div>
      )}
    </div>
  );
}

export default Compiler;