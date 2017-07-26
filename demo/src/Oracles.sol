pragma solidity ^0.4.11;

import "./BallotsManager.sol";

/**
@title Oracles Interface
@author Oracles
*/
contract Oracles is BallotsManager {
	function Oracles() {
		validators.push(owner);
	}
}