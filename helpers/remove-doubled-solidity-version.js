const { SEMICOLON, EMPTY } = require('./constants')
const pragmaSubstr = 'pragma solidity'

/*
 * Removes all pragma solidity instruction
 */
function removeDoubledSolidityVersion(content) {
	//1st pragma solidity declaration
	const { firstIndex, lastIndex } = getFirstPragma(content)
	const contentPart = content.substr(lastIndex)
	let contentFiltered = contentPart
	//remove other pragma solidity declarations
	const regex = new RegExp(pragmaSubstr,'gi')
	let result
	while ( (result = regex.exec(contentPart)) ) {
		const start = result.index
		const end = start + contentPart.substr(start).indexOf(SEMICOLON) + 1
		if (start != firstIndex) contentFiltered = contentFiltered.replace(contentPart.substring(start, end), EMPTY)
	}

	return contentFiltered
}

/*
 * Gets 1st pragma solidity instruction from content
 */
function getFirstPragma(content) {
	const firstIndex = content.indexOf(pragmaSubstr)
	const lastIndex = firstIndex + content.substr(firstIndex).indexOf(SEMICOLON) + 1
	const pragma = content.substr(0, lastIndex)
	return { pragma, firstIndex, lastIndex}
}

module.exports = {
	removeDoubledSolidityVersion,
	getFirstPragma,
}