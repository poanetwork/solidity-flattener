const { EOL } = require('os')
const newlineRe = /(\r\n|\r|\n)/g

function enforceLineEndingStyle(content) {
	return content.replaceAll(newlineRe, EOL)
}

module.exports = enforceLineEndingStyle
