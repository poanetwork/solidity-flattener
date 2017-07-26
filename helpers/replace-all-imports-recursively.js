const findAllImportPaths = require("./find-all-import-paths.js");
const replaceAllImportsInCurrentLayer = require("./replace-all-imports-in-current-layer");

function replaceAllImportsRecursively(fileContent, dir, cb) {
	let updatedFileContent = fileContent;
	findAllImportPaths(dir, updatedFileContent, function(_importObjs) {
		if (!_importObjs) return cb(updatedFileContent);
		if (_importObjs.length == 0) return cb(updatedFileContent);

		replaceAllImportsInCurrentLayer(0, _importObjs, updatedFileContent, dir, function(_updatedFileContent) {
			replaceAllImportsRecursively(_updatedFileContent, dir, cb);
		});
	});
};

module.exports = replaceAllImportsRecursively;