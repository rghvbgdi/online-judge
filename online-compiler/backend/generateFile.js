
//here we are using 'fs' module to write the code into a file
const fs = require('fs');

// require the path module to generate the file path
const path = require('path');

//generate unique id for the file name
const {v4 : uuidv4} = require('uuid'); //here we naming the v4 property to uuidv4 for readability

//storing the location of new folder by appending the codes folder to the project root , codes is the new folder 
const dirCodes = path.join(__dirname, 'codes');///Users/raghavbagdi/Documents/online-compiler/backend/codes

if(!fs.existsSync(dirCodes)){
    fs.mkdirSync(dirCodes,{recursive: true});
}

const generateFile = (language,code) => {
    const jobId = uuidv4();
    const filename = `${jobId}.${language}`;   
    const filePath = path.join(dirCodes, filename);//telling the location of new file inside new folder
    fs.writeFileSync(filePath, code); //writing the code into the file , by using the filePath we just got and the code 
    return filePath;  //returning the path of the file
    

};

module.exports= generateFile;