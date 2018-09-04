const findAllImportPaths = require('./find-all-import-paths')
const replaceAllImportsInCurrentLayer = require('./replace-all-imports-in-current-layer')

function replaceAllImportsRecursively(fileContent, dir, cb) {
	let updatedFileContent = fileContent
	findAllImportPaths(dir, updatedFileContent, (importObjs) => {
		if (!importObjs) {
			return cb(updatedFileContent)
		}
		if (importObjs.length == 0) {
			return cb(updatedFileContent)
		}

		replaceAllImportsInCurrentLayer(0, importObjs, updatedFileContent, dir, (_updatedFileContent) => {
			replaceAllImportsRecursively(_updatedFileContent, dir, cb)
		})
	})
}

module.exports = replaceAllImportsRecursively