const os = require('os')
const constants = require('./constants')

function deduplicateSolidityVersoins(content) {
	return deduplicateLines(content, [constants.SOL_VERSION_PREFIX])
}

function deduplicateSolidityExpHeaders(content) {
	return deduplicateLines(content, [constants.SOL_EXP_HEADER_PREFIX])
}

function deduplicateLicenses(content) {
	return deduplicateLines(content, [constants.LICENSE_PREFIX_1, constants.LICENSE_PREFIX_2])
}

function deduplicateLines(content, linePrefixes) {
	const isTargetLine = (line) => {
		const lineTrimed = line.trim()
		for(const linePrefix of linePrefixes) {
			if (lineTrimed.indexOf(linePrefix) >= 0) {
				return true
			}
		}
		return false
	}

	const cleanTargetLine = (line) => {
		for(const linePrefix of linePrefixes) {
			const idx = line.indexOf(linePrefix)
			if (idx >= 0) {
				return line.substr(0, idx)
			}
		}
		return line
	}

	const lines = content.split(os.EOL)
	let isFirst = true
	let newContent = ''
	for (const line of lines) {
		if (isTargetLine(line)) {
			if (isFirst) {
				newContent += line + os.EOL
				isFirst = false
			} else {
				newContent += cleanTargetLine(line) + os.EOL
			}
		} else {
			newContent += line + os.EOL
		}
	}

	return newContent
}

module.exports = {
	deduplicateLicenses,
	deduplicateSolidityVersoins,
	deduplicateSolidityExpHeaders
}
