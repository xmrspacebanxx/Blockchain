// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract US is ERC20, Ownable {
    IERC20 public usdc;
    uint256 public feePercentage = 2;
    address public feeReceiver; 

    constructor(address initialOwner, address _usdc) ERC20("US","US") Ownable(initialOwner) {
        usdc = IERC20(_usdc);
        feeReceiver = initialOwner;

    }

    function mint(address to, uint256 amount) public onlyOwner{
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function swapUSDC(uint256 amount) public {
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC not transferred");
        _mint(msg.sender, amount);
    }

    function redeemUSDC(uint256 amount) public {
        _burn(msg.sender, amount);
        require(usdc.transfer(msg.sender, amount), "USDC not transferred");
    }

    function setFee(uint256 newFee) public onlyOwner {
        require(newFee <= 2, "The rate cannot be greater than 2%");
        feePercentage = newFee;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        uint256 fee = (amount * feePercentage) / 100;
        uint256 amountAfterFee = amount - fee;

        super.transfer(feeReceiver, fee);
        return super.transfer(to, amountAfterFee);
    }
}