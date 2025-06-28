// Use fs/promises for asynchronous file operations
const fs = require('fs/promises');
// Path module for file paths
const path = require('path');
// Generate unique IDs for filenames
const {v4 : uuidv4} = require('uuid');
// Directory to store code files
const dirCodes = path.join(__dirname, 'codes');
const generateFile = async (language,code) => {
    const jobId = uuidv4();
    const filename = `${jobId}.${language}`;   
    const filePath = path.join(dirCodes, filename);

    await fs.mkdir(dirCodes, { recursive: true }); // Ensure directory exists asynchronously
    await fs.writeFile(filePath, code); // Write code to file asynchronously
    return filePath;
    
};

module.exports= generateFile;