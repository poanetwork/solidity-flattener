const constants = require('./constants')

function cleanPath(path) {
	let cleanedPath
	if (path.includes(constants.DIRTY_PATH)) {
		const re = new RegExp(constants.DIRTY_PATH, 'g')
		cleanedPath = path.replace(re, constants.SLASH)
	} else {
		cleanedPath = path
	}

	if (cleanedPath.includes(constants.DIRTY_PATH)) {
		return cleanPath(cleanedPath)
	} else {
		return cleanedPath
	}
}

module.exports = cleanPath