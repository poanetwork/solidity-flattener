pragma solidity ^0.4.11;

contract BallotClass {
    uint[] public ballots;
    uint public votingLowerLimit = 3;
    
    struct Ballot {
        address owner;
        address miningKey;
        address affectedKey;
        string memo;
        uint affectedKeyType;
        uint createdAt;
        uint votingStart;
        uint votingDeadline;
        int votesAmmount;
        int result;
        bool addAction;
        bool active;
        mapping (address => bool) voted;
    }
    
    mapping(uint => Ballot) public ballotsMapping;
}