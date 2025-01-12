// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

// Import the AggregatorV3Interface from Chainlink
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockPriceFeed is AggregatorV3Interface {
    int256 public price;
    uint8 public decimals;

    constructor(int256 _initialPrice, uint8 _decimals) {
        price = _initialPrice;
        decimals = _decimals;
    }

    function description() external pure override returns (string memory) {
        return "Mock Price Feed";
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    function getRoundData(
        uint80 /* _roundId */
    )
        external
        pure
        override
        returns (uint80, int256, uint256, uint256, uint80)
    {
        revert("Not implemented");
    }

    function latestRoundData()
        external
        view
        override
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (0, price, block.timestamp, block.timestamp, 0);
    }

    function setPrice(int256 _price) external {
        price = _price;
    }
}
