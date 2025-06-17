const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const generateInputFile = require('./generateInputFile.js');
const outputPath = path.join(__dirname, 'outputs');///Users/raghavbagdi/Documents/online-compiler/backend/codes

if(!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath,{recursive: true});
}

// http://localhost:8000/Users/raghavbagdi/Documents/online-compiler/backend/codes/2f79b636-ee6a-4a6d-b396-947a211d8d7e.cpp



const executeCpp = (filePath, generateInputFile) =>{
    const jobId = path.basename(filePath).split(".")[0]; //"2f79b636-ee6a-4a6d-b396-947a211d8d7e"
    const output_filename  = `${jobId}.out`; //"2f79b636-ee6a-4a6d-b396-947a211d8
    const outPath = path.join(outputPath, output_filename); ///Users/raghavbagdi/Documents/online-compiler/backend/outputs/2f79b636-ee6a-4a6d-b396-947a211d8d7e.out
    return new Promise((resolve, reject) => {

    exec(`g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${output_filename} < ${generateInputFile}`, (error, stdout, stderr) => {
            if (error) {
                reject({error,stderr});
            } 
            if(stderr){
                reject({stderr});
            }
            if(stdout){
                resolve(stdout);
            }
        }); 
    });
};



module.exports = executeCpp;


// functionality->
// code.cpp -> code.out -> code.out -> print output
// code.cpp -> code.exe -> code.exe -> print output