pragma solidity ^0.4.4;

contract Remittance {
    uint public balance;
    bytes32 public pwHash;
    address public exchange; // Carol

    function Remittance(bytes32 _pwHash, address _exchange)
        public
        payable {

        balance = msg.value;

        pwHash = _pwHash;
        exchange = _exchange;
    }

    function withdraw(bytes32 receivePw, bytes32 exchangePw) // Bob's then Carol's pw
        public
        returns(bool success) {

        require(balance > 0);
        require(msg.sender == exchange); // prevent front-running

        require(keccakTwo(receivePw, exchangePw) == pwHash);

        uint amt = balance;
        balance = 0;
        msg.sender.transfer(amt);

        return true;
    }

    function keccakTwo(bytes32 input1, bytes32 input2) constant // for testing
        public
        returns(bytes32 result) {

        return keccak256(input1, input2);
    }
}
