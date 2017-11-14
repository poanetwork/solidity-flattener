#! /usr/bin/env node
const fs = require('fs');
const glob = require("glob");
const pathLib = require("path");
const variables = require("./helpers/variables.js");
const removeDoubledSolidityVersion = require("./helpers/remove-doubled-solidity-version.js");
const replaceAllImportsRecursively = require("./helpers/replace-all-imports-recursively.js");

fs.readFile(variables.inputFilePath, "utf8", readInputFileCallBack);

function readInputFileCallBack(err, inputFileContent) {
	if (err) return console.log(err.message);

	generateFlatFile(variables.parentDir + "/", variables.parentDir + "/**/*.sol", inputFileContent);
}

function generateFlatFile(dir, path, inputFileContent) {
	glob(path, function(err, srcFiles) {
		variables.allSrcFiles = srcFiles;
		if (err) return console.log(err.message);
		getAllSolFilesCallBack(inputFileContent, dir, path, srcFiles);
	});
}

function getAllSolFilesCallBack(inputFileContent, dir, path, srcFiles) {
	replaceAllImportsRecursively(inputFileContent, dir, function(outputFileContent) {
		outputFileContent = removeDoubledSolidityVersion(outputFileContent);
		if (!fs.existsSync(variables.outDir)) fs.mkdirSync(variables.outDir);
		fs.writeFileSync(variables.outDir + "/" + variables.flatContractPrefix + "_flat.sol", outputFileContent);
		console.log("Success! Flat file is generated to " + variables.outDir + " directory");
	});
}
