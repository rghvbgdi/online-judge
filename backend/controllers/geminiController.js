// controllers/geminiController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiFeedback = async (req, res) => {
  try {
    const {
      code = '',
      language = 'cpp',
      title = 'Untitled',
      description = 'No description provided.',
      input = '',
      output = '',
    } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a code review assistant. A user has submitted a solution for the problem titled: "${title}".

${description ? `Problem Description:\n${description}` : ''}

${input ? `Sample Input:\n${input}` : ''}
${output ? `Expected Output:\n${output}` : ''}

The user used the language: ${language}

Here is the submitted code:
\`\`\`${language}
${code}
\`\`\`

Please do the following:
- If the code is empty or missing logic, tell the user to write a solution.
- If the solution is incorrect or inefficient, suggest improvements concisely.
- Do NOT rewrite the entire code unless absolutely necessary.
- Focus on algorithmic and structural suggestions over style.

Reply with crisp feedback.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "text/plain" },
    });

    const response = await result.response;
    const feedback = response.text();

    res.status(200).json({ feedback });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to get feedback from Gemini." });
  }
};

module.exports = {
  getGeminiFeedback,
};