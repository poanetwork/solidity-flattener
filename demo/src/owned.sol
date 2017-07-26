pragma solidity ^0.4.11;

contract owned {
    address public owner;

    function owned() {
        owner = 0xDd0BB0e2a1594240fED0c2f2c17C1E9AB4F87126; //msg.sender
    }

    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _;
    }
}