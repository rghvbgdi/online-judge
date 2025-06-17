const express = require('express');
const generateFile = require('./generateFile.js');
const executeCpp = require('./executeCpp.js');
const generateInputFile = require('./generateInputFile.js');



const cors = require('cors');
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  




    

//consider the online compiler API endpoints here.
app.post('/run', async (req, res) => {
    // Destructure language and code from request body, default language to 'cpp'
    const { language = 'cpp', code, input } = req.body;

    // If code is not provided, return a 400 Bad Request error
    if (!code) {
        return res.status(400).json({ success: false, error: 'code is required' });
    }
    try {
        // Generate the file containing the code
        const filePath =  generateFile(language, code);
        const inputFilePath =  generateInputFile(input);
        // Compile and execute the C++ code, await the output
        const output = await executeCpp(filePath, inputFilePath);

        // Respond with the output and file path
        res.json({ filePath, output });

    } catch (error) {
        // Log and respond with a 500 Internal Server Error if something goes wrong
        console.error("Error running code:", error.message);
        return res.status(500).json({ success: false, error: 'An error occurred while running the code' });
    }
});




app.get('/', (req, res) => {
    res.send('Hello, this is the Online Compiler Server at port 8000!');
});
