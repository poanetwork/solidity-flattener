const fs = require('fs');
const glob = require("glob");
const path = require("path");
const variables = require("./variables.js");
const changeRelativePathToAbsolute = require("./change-relative-path-to-absolute.js");

function byName(dir, fileName, cb) {
	glob(dir + "/**/*.sol", function(err, srcFiles) {
		if (err) return console.log(err.message);
		
		for (var j = 0; j < srcFiles.length; j++) {
			if (path.basename(srcFiles[j]) == fileName) {
				var fileContent = fs.readFileSync(srcFiles[j], "utf8");
				cb(fileContent);
				return;
			}
		}

		dir = dir.substring(0, dir.lastIndexOf("/"));
		byName(dir, fileName, cb);
	});
}

function byNameAndReplace(dir, filePath, updatedFileContent, importStatement, cb) {
	glob(dir + "/**/*.sol", function(err, srcFiles) {
		if (err) return console.log(err.message);
		
		var importIsReplacedBefore = false;
		byNameAndReplaceInner(importStatement, updatedFileContent, dir, filePath, srcFiles, 0, cb, function() {
			if (importIsReplacedBefore) {
				updatedFileContent = updatedFileContent.replace(importStatement, "");
				cb(updatedFileContent);
			} else {
				if (dir.indexOf("/") > -1) {
					dir = dir.substring(0, dir.lastIndexOf("/"));
					byNameAndReplace(dir, filePath, updatedFileContent, importStatement, cb);
				} else {
					updatedFileContent = updatedFileContent.replace(importStatement, "");
					cb(updatedFileContent);
				}
			}
		})
	});
}

function byNameAndReplaceInner(importStatement, updatedFileContent, dir, filePath, srcFiles, j, cb, cbInner) {
	if (j >= srcFiles.length) return cbInner()
	const findAllImportPaths = require("./find-all-import-paths.js");
	let isAbsolutePath = filePath.indexOf(".") != 0
	if (isAbsolutePath && srcFiles[j].indexOf(filePath) > -1) {

		if (!variables.importedSrcFiles.hasOwnProperty(path.basename(srcFiles[j]))
			|| fs.existsSync(filePath)) {
			let fileContent 
			if (fs.existsSync(filePath)) fileContent = fs.readFileSync(filePath, "utf8")
			else fileContent = fs.readFileSync(srcFiles[j], "utf8");

			findAllImportPaths(dir, fileContent, function(_importObjs) {
				fileContent = changeRelativePathToAbsolute(fileContent, srcFiles[j], _importObjs);

				if (fileContent.indexOf(" is ") > -1) {
					updatedFileContent = updatedFileContent.replace(importStatement, fileContent);
				} else {
					//updatedFileContent = updatedFileContent.replace(importStatement, fileContent);
					updatedFileContent = updatedFileContent.replace(importStatement, "");
					updatedFileContent = fileContent + updatedFileContent;
				}
				variables.importedSrcFiles[path.basename(srcFiles[j])] = fileContent;
				return cb(updatedFileContent);
			});
		} else {
			updatedFileContent = updatedFileContent.replace(importStatement, "");
			//issue #2.
			if (updatedFileContent.indexOf(variables.importedSrcFiles[path.basename(dir + importObj.dependencyPath)] > -1)
				&& updatedFileContent.indexOf("import ") == -1) {
				var fileContent = fs.readFileSync(srcFiles[j], "utf8");
				updatedFileContent = updatedFileContent.replace(variables.importedSrcFiles[path.basename(dir + importObj.dependencyPath)], "");
				updatedFileContent = fileContent + updatedFileContent;
			}
			importIsReplacedBefore = true;
			j++;
			byNameAndReplaceInner(importStatement, updatedFileContent, dir, filePath, srcFiles, j, cb, cbInner)
		}
	} else {
		j++;
		byNameAndReplaceInner(importStatement, updatedFileContent, dir, filePath, srcFiles, j, cb, cbInner)
	}
}

module.exports = {
	byName: byName,
	byNameAndReplace: byNameAndReplace
};