// Use fs/promises for asynchronous file operations
const fs = require('fs/promises');
// Path module for file paths
const path = require('path');
// Generate unique IDs for filenames
const {v4 : uuidv4} = require('uuid');
// Directory to store input files
const dirInput = path.join(__dirname, 'inputs');
const generateInputFile = async (input) => {
    const jobId = uuidv4();
    const inputFileName = `${jobId}.txt`;   
    const inputFilePath = path.join(dirInput, inputFileName);

    await fs.mkdir(dirInput, { recursive: true }); // Ensure directory exists asynchronously
    await fs.writeFile(inputFilePath, input); // Write input to file asynchronously
    return inputFilePath;
};

module.exports= generateInputFile;