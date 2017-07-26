const updateImportObjectLocationInTarget = require("./update-import-object-location-in-target.js");
const findAllImportPaths = require("./find-all-import-paths.js");

function replaceRelativeImportPaths(fileContent, curDir, cb) {
	let updatedFileContent = fileContent;
	findAllImportPaths(curDir, fileContent, function(importObjs) {
		if (!importObjs) return cb(updatedFileContent);
		if (importObjs.length == 0) return cb(updatedFileContent);

		for (let j = 0; j < importObjs.length; j++) {
			let importObj = importObjs[j];

			importObj = updateImportObjectLocationInTarget(importObj, updatedFileContent);
			let importStatement = updatedFileContent.substring(importObj.startIndex, importObj.endIndex);
			
			let newPath;
			if (importObj.dependencyPath.indexOf("../") == 0) {
				newPath = curDir + importObj.dependencyPath;
			}
			else if (importObj.dependencyPath.indexOf("./") == 0) {
				newPath = curDir + importObj.dependencyPath;
			}
			else {
				newPath = importObj.dependencyPath;
			}
			let importStatementNew = importStatement.replace(importObj.dependencyPath, newPath);
			updatedFileContent = updatedFileContent.replace(importStatement, importStatementNew);
		}
		cb(updatedFileContent);
	});
}

module.exports = replaceRelativeImportPaths;