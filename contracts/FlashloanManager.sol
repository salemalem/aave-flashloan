// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

// Import necessary interfaces from Aave
import {IFlashLoanSimpleReceiver} from "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanSimpleReceiver.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

// Import IERC20 for token interactions
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FlashloanManager
 * @dev A contract that demonstrates taking and repaying a flash loan from Aave V3 on Arbitrum
 */
contract FlashloanManager is IFlashLoanSimpleReceiver {
    // Aave Pool Addresses Provider
    IPoolAddressesProvider public immutable override ADDRESSES_PROVIDER;
    // Aave Pool
    IPool public immutable override POOL;

    // USDC token address on Arbitrum
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;

    /**
     * @dev Constructor initializes the Aave Pool Addresses Provider and Pool
     * @param provider The address of the Aave Pool Addresses Provider (0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb for Arbitrum)
     */
    constructor(address provider) {
        ADDRESSES_PROVIDER = IPoolAddressesProvider(provider);
        POOL = IPool(ADDRESSES_PROVIDER.getPool());
    }

    /**
     * @dev Initiates a flash loan for the specified amount
     * @param amount The amount of USDC to borrow (in wei units)
     */
    function requestFlashLoan(uint256 amount) external {
        // Address of the asset to flash loan (USDC)
        address asset = USDC;

        // Encode arbitrary data to pass to executeOperation (not used in this simple example)
        bytes memory params = "";

        // 0 = no referral
        uint16 referralCode = 0;

        // Request the flash loan
        POOL.flashLoanSimple(
            address(this),
            asset,
            amount,
            params,
            referralCode
        );
    }

    /**
     * @dev Executes an operation after receiving the flash loan
     * @param asset The address of the flash-borrowed asset (USDC)
     * @param amount The amount of the flash-borrowed asset
     * @param premium The fee of the flash-borrowed asset
     * @param initiator The address initiating the flash loan
     * @param params Arbitrary bytes containing optional data
     * @return True if the execution was successful
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Validate that only the Aave Pool can call this function
        require(msg.sender == address(POOL), "Caller must be Aave Pool");
        require(initiator == address(this), "Initiator must be this contract");

        // At this point, the contract has received the flash loan
        // You would typically perform some operation here

        // In this simple example, we just repay the loan immediately

        // Calculate total amount to repay (amount + premium)
        uint256 totalAmount = amount + premium;

        // Approve the Pool to pull the total amount from this contract
        IERC20(asset).approve(address(POOL), totalAmount);

        return true;
    }

    /**
     * @dev Emergency function to withdraw any ERC20 tokens sent to this contract by mistake
     * @param token The token address to withdraw
     * @param to The recipient address
     * @param amount The amount to withdraw
     */
    function withdrawERC20(address token, address to, uint256 amount) external {
        require(token != USDC, "Cannot withdraw flashloaned USDC");
        IERC20(token).transfer(to, amount);
    }
}
