const fs = require('fs');
const glob = require("glob");
const path = require("path");
const variables = require("./variables.js");

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

function byNameAndReplace(dir, fileName, updatedFileContent, importStatement, cb) {
	glob(dir + "/**/*.sol", function(err, srcFiles) {
		if (err) return console.log(err.message);
		
		var importIsReplacedBefore = false;
		for (var j = 0; j < srcFiles.length; j++) {
			if (path.basename(srcFiles[j]) == fileName) {
				if (variables.importedSrcFiles.indexOf(srcFiles[j]) === -1) {
					var fileContent = fs.readFileSync(srcFiles[j], "utf8");
					updatedFileContent = updatedFileContent.replace(importStatement, fileContent);
					variables.importedSrcFiles.push(srcFiles[j]);
					cb(updatedFileContent);
					return;
				} else {
					importIsReplacedBefore = true;
				}
				break;
			}
		}

		if (importIsReplacedBefore) {
			updatedFileContent = updatedFileContent.replace(importStatement, "");
			cb(updatedFileContent);
		} else {
			if (dir.indexOf("/") > -1) {
				dir = dir.substring(0, dir.lastIndexOf("/"));
				byNameAndReplace(dir, fileName, updatedFileContent, importStatement, cb);
			} else {
				updatedFileContent = updatedFileContent.replace(importStatement, "");
				cb(updatedFileContent);
			}
		}
	});
}

module.exports = {
	byName: byName,
	byNameAndReplace: byNameAndReplace
};