const fs = require('fs');
const path = require("path");
const variables = require("./variables.js");
const findFile = require("./find-file.js");
const replaceRelativeImportPaths = require("./replace-relative-import-paths.js");
const updateImportObjectLocationInTarget = require("./update-import-object-location-in-target.js");

function replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir, cb) {
	if (i < importObjs.length) {
		var importObj = importObjs[i];
		importObj = updateImportObjectLocationInTarget(importObj, updatedFileContent);

		//replace contracts aliases
		if (importObj.contractName) {
			updatedFileContent = updatedFileContent.replace(importObj.alias + ".", importObj.contractName + ".");
		}
		
		var importStatement = updatedFileContent.substring(importObj.startIndex, importObj.endIndex);

		var fileExists = fs.existsSync(dir + importObj.dependencyPath, fs.F_OK);
		if (fileExists) {
			console.log("###" + importObj.dependencyPath + " SOURCE FILE FOUND###");
			var importedFileContent = fs.readFileSync(dir + importObj.dependencyPath, "utf8");
			replaceRelativeImportPaths(importedFileContent, path.dirname(importObj.dependencyPath) + "/", function(importedFileContentUpdated) {
				if (!variables.importedSrcFiles.hasOwnProperty(path.basename(dir + importObj.dependencyPath))) {
					variables.importedSrcFiles[path.basename(dir + importObj.dependencyPath)] = importedFileContentUpdated;
					if (importedFileContentUpdated.indexOf(" is ") > -1) {
						updatedFileContent = updatedFileContent.replace(importStatement, importedFileContentUpdated);
					} else {
						updatedFileContent = updatedFileContent.replace(importStatement, "");
						updatedFileContent = importedFileContentUpdated + updatedFileContent;
					}
				}
				else {
					updatedFileContent = updatedFileContent.replace(importStatement, "");
					//issue #1.
					if (updatedFileContent.indexOf(variables.importedSrcFiles[path.basename(dir + importObj.dependencyPath)] > -1)
						&& updatedFileContent.indexOf("import ") == -1) {
						updatedFileContent = updatedFileContent.replace(variables.importedSrcFiles[path.basename(dir + importObj.dependencyPath)], "");
						updatedFileContent = importedFileContentUpdated + updatedFileContent;
					}
				}

				i++;
				replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir, cb);
			});
		} else {
			if (!variables.importedSrcFiles.hasOwnProperty(path.basename(dir + importObj.dependencyPath))) {
				console.log("!!!" + importObj.dependencyPath + " SOURCE FILE NOT FOUND. TRY TO FIND IT RECURSIVELY!!!");
				findFile.byNameAndReplace(dir.substring(0, dir.lastIndexOf("/")), path.basename(importObj.dependencyPath), updatedFileContent, importStatement, function(_updatedFileContent) {
					i++;
					console.log("###" + importObj.dependencyPath + " SOURCE FILE FOUND###");
					replaceAllImportsInCurrentLayer(i, importObjs, _updatedFileContent, dir, cb);
				});
			} else {
				updatedFileContent = updatedFileContent.replace(importStatement, "");
				i++;
				replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir, cb);
			}
		}
	} else cb(updatedFileContent);
}

module.exports = replaceAllImportsInCurrentLayer;