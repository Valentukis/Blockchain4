// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract CarRepairEscrow {

    address public owner;        // Car owner
    address public mechanic;     // Mechanic doing the repair
    address public inspector;    // Inspector confirming completion

    uint public price;           // Repair price in wei
    string public description;   // Description of the repair

    enum Status {
        NotCreated,
        Requested,
        Accepted,
        Paid,
        Completed,
        Confirmed
    }

    Status public status = Status.NotCreated;

    event RequestCreated(address owner, uint price, string description);
    event JobAccepted(address mechanic);
    event PaymentDeposited(address owner, uint amount);
    event JobCompleted(address mechanic);
    event JobConfirmed(address inspector);
    event Refunded(address owner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyMechanic() {
        require(msg.sender == mechanic, "Not mechanic");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Not inspector");
        _;
    }

    function createRequest(uint _price, string memory _description, address _inspector) public {
        require(status == Status.NotCreated, "Request already created");

        owner = msg.sender;
        price = _price;
        description = _description;
        inspector = _inspector;
        status = Status.Requested;

        emit RequestCreated(owner, price, description);
    }

    function acceptJob() public {
        require(status == Status.Requested, "Not requested state");
        mechanic = msg.sender;
        status = Status.Accepted;

        emit JobAccepted(mechanic);
    }

    function depositPayment() public payable onlyOwner {
        require(status == Status.Accepted, "Job not accepted");
        require(msg.value == price, "Incorrect payment amount");

        status = Status.Paid;
        emit PaymentDeposited(msg.sender, msg.value);
    }

    function markCompleted() public onlyMechanic {
        require(status == Status.Paid, "Payment not received yet");

        status = Status.Completed;
        emit JobCompleted(msg.sender);
    }

    function confirmCompletion() public onlyInspector {
        require(status == Status.Completed, "Job not completed");

        status = Status.Confirmed;

        // release funds to mechanic
        payable(mechanic).transfer(price);

        emit JobConfirmed(msg.sender);
    }

    function refundOwner() public onlyMechanic {
        require(status == Status.Accepted || status == Status.Paid, "No refund allowed");

        payable(owner).transfer(address(this).balance);
        status = Status.Requested;

        emit Refunded(owner);
    }
}
