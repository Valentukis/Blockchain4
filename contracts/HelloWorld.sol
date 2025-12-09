// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract HelloWorld {

    string public message = "Hello, blockchain!";

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
}
