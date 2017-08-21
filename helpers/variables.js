const path = require("path");
const fs = require('fs');

const configPath = "./config.json";
let configExists = fs.existsSync(configPath, fs.F_OK);
let config;
if (configExists) config = JSON.parse(fs.readFileSync(configPath, "utf8"));

//Input solidity file path
let args = process.argv.slice(2);
let inputFilePath = args.length > 0?args[0]:config?config.inputFilePath:"";
//Input solidity file dir name
let inputFileDir = path.dirname(inputFilePath);
//Input parent dir
let parentDir = inputFileDir;
//Output directory to store flat combined solidity file
let outDir = args.length > 1?args[1]:config?config.outputDir:"./out";
let flatContractPrefix = args.length > 2?args[2]:path.basename(inputFilePath, ".sol");

let allSrcFiles = [];
let importedSrcFiles = {};


module.exports = {
	args: args,
	inputFilePath: inputFilePath,
	inputFileDir: inputFileDir,
	parentDir: parentDir,
	outDir: outDir,
	allSrcFiles: allSrcFiles,
    importedSrcFiles: importedSrcFiles,
    flatContractPrefix: flatContractPrefix
}