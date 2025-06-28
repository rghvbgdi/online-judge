const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const outputPath = path.join(__dirname, 'outputs'); // Directory for compiled executables and outputs

if(!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath,{recursive: true});
}

// Function to compile and execute C++ code
const executeCpp = (filePath, inputFilePath) =>{ // Renamed parameter for clarity
    const jobId = path.basename(filePath).split(".")[0];
    const output_filename  = `${jobId}.out`;
    const outPath = path.join(outputPath, output_filename);
    return new Promise((resolve, reject) => {
        exec(
            `g++ ${filePath} -o ${outPath} && cd ${outputPath} && ./${output_filename} < ${inputFilePath}`, // Corrected input file path usage
                { timeout: 2000 },
                (error, stdout, stderr) => {
                    // Cleanup should happen here, regardless of success or failure
                    try {
                        if (fs.existsSync(outPath)) { // Check if file exists before unlinking
                            fs.unlinkSync(outPath); // Delete the executable after execution attempt
                        }
                    } catch (err) {
                        console.error(`Failed to delete executable file ${outPath}:`, err.message);
                    }

                    if (stderr && stderr.includes('error:')) {
                        const formatted = stderr
                            .split('\n')
                            .map(line => {
                                const match = line.match(/\.\/codes\/.*?:(\d+:\d+): (.*)/);
                                return match ? `Line ${match[1]}: ${match[2]}` : line;
                            })
                            .join('\n');
                        return reject({ type: 'compile', message: formatted });
                    }

                    if (error) {
                        if (error.killed) {
                            return reject({ type: 'timeout', message: '❌ Time Limit Exceeded (Possible infinite loop)' });
                        }
                        return reject({ type: 'runtime', message: error.message });
                    }

                    if (stdout) {
                        return resolve(stdout);
                    }

                    return reject({ type: 'runtime', message: 'No output produced by the program.' });
                }
        );
    });
};

module.exports = executeCpp;