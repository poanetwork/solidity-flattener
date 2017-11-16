const fs = require('fs');
const path = require("path");
const variables = require("./variables.js");
const findFile = require("./find-file.js");
const replaceRelativeImportPaths = require("./replace-relative-import-paths.js");
const updateImportObjectLocationInTarget = require("./update-import-object-location-in-target.js");
const changeRelativePathToAbsolute = require("./change-relative-path-to-absolute.js");
const findAllImportPaths = require("./find-all-import-paths.js");

function replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir, cb) {
	if (i < importObjs.length) {
		var importObj = importObjs[i];
		importObj = updateImportObjectLocationInTarget(importObj, updatedFileContent);

		//replace contracts aliases
		if (importObj.contractName) {
			updatedFileContent = updatedFileContent.replace(importObj.alias + ".", importObj.contractName + ".");
		}
		
		let importStatement = updatedFileContent.substring(importObj.startIndex, importObj.endIndex);

		let fileExists
		let filePath
		let isRelativePath = importObj.dependencyPath.indexOf(".") == 0
		if (isRelativePath) {
			filePath = dir + importObj.dependencyPath
			fileExists = fs.existsSync(filePath, fs.F_OK);
		}
		else {
			filePath = importObj.dependencyPath
			fileExists = fs.existsSync(filePath, fs.F_OK);
		}
		if (fileExists) {
			console.log("###" + importObj.dependencyPath + " SOURCE FILE FOUND###");
			var importedFileContent = fs.readFileSync(filePath, "utf8");

			findAllImportPaths(dir, importedFileContent, function(_importObjs) {
				importedFileContent = changeRelativePathToAbsolute(importedFileContent, filePath, _importObjs);
				replaceRelativeImportPaths(importedFileContent, path.dirname(importObj.dependencyPath) + "/", function(importedFileContentUpdated) {
					if (!variables.importedSrcFiles.hasOwnProperty(path.basename(filePath))) {
						variables.importedSrcFiles[path.basename(filePath)] = importedFileContentUpdated;
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
						if (updatedFileContent.indexOf(variables.importedSrcFiles[path.basename(filePath)] > -1)
							&& updatedFileContent.indexOf("import ") == -1) {
							updatedFileContent = updatedFileContent.replace(variables.importedSrcFiles[path.basename(filePath)], "");
							updatedFileContent = importedFileContentUpdated + updatedFileContent;
						}
					}

					i++;
					replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir, cb);
				});
			})
		} else {
			if (!variables.importedSrcFiles.hasOwnProperty(path.basename(filePath))) {
				console.log("!!!" + importObj.dependencyPath + " SOURCE FILE NOT FOUND. TRY TO FIND IT RECURSIVELY!!!");
				
				var directorySeperator;
				if (process.platform === "win32") {
					directorySeperator = "\\";
				} else {
					directorySeperator = "/";
				}
				
				findFile.byNameAndReplace(dir.substring(0, dir.lastIndexOf(directorySeperator)), importObj.dependencyPath, updatedFileContent, importStatement, function(_updatedFileContent) {
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
