pragma solidity ^0.4.11;

contract KeyClass {
    struct InitialKey {
        bool isNew;
    }
   
    struct MiningKey {
        bool isActive;
    }
    
    struct PayoutKey {
        bool isActive;
    }

    struct VotingKey {
        bool isActive;
    }
    
    mapping(address => MiningKey) public miningKeys;
    mapping(address => PayoutKey) public payoutKeys;
    mapping(address => VotingKey) public votingKeys;
    mapping(address => InitialKey) public initialKeys;
    mapping(address => address) public votingMiningKeysPair;
    mapping(address => address) public miningPayoutKeysPair;
}