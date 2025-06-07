
//here we are using 'fs' module to write the code into a file
const fs = require('fs');

// require the path module to generate the file path
const path = require('path');

//generate unique id for the file name
const {v4 : uuidv4} = require('uuid'); //here we naming the v4 property to uuidv4 for readability

//storing the location of new folder by appending the codes folder to the project root , codes is the new folder 
const dirInput = path.join(__dirname, 'inputs');///Users/raghavbagdi/Documents/online-compiler/backend/inputs

if(!fs.existsSync(dirInput)){
    fs.mkdirSync(dirInput,{recursive: true});
}

const generateInputFile = (input) => {
    const jobId = uuidv4();
    const inputFileName = `${jobId}.txt`;   
    const inputFilePath = path.join(dirInput, inputFileName);//telling the location of new file inside new folder
    fs.writeFileSync(inputFilePath, input); //writing the code into the file , by using the filePath we just got and the code 
    return inputFilePath;  //returning the path of the file
};

module.exports= generateInputFile;