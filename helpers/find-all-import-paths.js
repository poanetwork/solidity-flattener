const fs = require('fs');
const path = require('path');
var decomment = require('decomment');
const findFile = require("./find-file.js");

function findAllImportPaths(dir, content, cb) {
  //strip comments from content
	content = decomment(content, {safe: true})
	const subStr = "import ";
	let allImports = [];
	let regex = new RegExp(subStr,"gi");
	var importsCount = (content.match(regex) || []).length;
	let importsIterator = 0;
	while ( (result = regex.exec(content)) ) {
		let startImport = result.index;
		let endImport = startImport + content.substr(startImport).indexOf(";") + 1;
		let fullImportStatement = content.substring(startImport, endImport);
		let dependencyPath = fullImportStatement.split("\"").length > 1 ? fullImportStatement.split("\"")[1]: fullImportStatement.split("'")[1];
		let alias = fullImportStatement.split(" as ").length > 1?fullImportStatement.split(" as ")[1].split(";")[0]:null;
		let contractName;

		importObj = {
			"startIndex": startImport, 
			"endIndex": endImport, 
			"dependencyPath": dependencyPath, 
			"fullImportStatement": fullImportStatement,
			"alias": alias,
			"contractName": null
		};

		if (alias) {
			alias = alias.replace(/\s/g,'');
			var fileExists = fs.existsSync(dependencyPath, fs.F_OK);
			if (fileExists) {
				importsIterator++;
				let fileContent = fs.readFileSync(dependencyPath, "utf8");
				if (fileContent.indexOf("contract ") > -1) {
					importObj.contractName = getContractName(fileContent);
				}
				allImports.push(importObj);
			} else {
				findFile.byName(dir.substring(0, dir.lastIndexOf("/")), path.basename(dependencyPath), function(fileContent) {
					importsIterator++;
					if (fileContent.indexOf("contract ") > -1) {
						importObj.contractName = getContractName(fileContent);
					}
					allImports.push(importObj);

					if (importsIterator == importsCount) cb(allImports);
				});
			}
		} else {
			importsIterator++;
			allImports.push(importObj);
		}
	}
	if (importsIterator == importsCount) cb(allImports);
}

function getContractName(fileContent) {
	return fileContent.substring((fileContent.indexOf("contract ") + ("contract ").length), fileContent.indexOf("{")).replace(/\s/g,'')
}

module.exports = findAllImportPaths;
